import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { CreateReservationSchema } from "@/lib/validation/reservation";
import { getPrice } from "@/lib/pricing";
import { istToUtcMs } from "@/utils/time";
import { generateUniquePNR } from "@/lib/server/pnr";
import { normalizePlaceFields } from "@/lib/domain/places";
import { logCreated } from "@/lib/server/reservationEvents";
import { notify } from "@/lib/server/notifications";
import { SITE } from "@/config/site";
import { reservationCreateLimiter, getClientIp } from "@/lib/server/rateLimit";
import type { VehicleType } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(req);
    if (!reservationCreateLimiter.check(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = CreateReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const adminDb = getAdminDbOrThrow();

    // Server-authoritative price computation
    const price = input.vehicleType
      ? getPrice(input.from, input.to, input.vehicleType as VehicleType)
      : null;

    // Server-authoritative startAt computation
    const startAt = istToUtcMs(input.date, input.time);

    // Collision-resistant PNR
    const code = await generateUniquePNR(adminDb);
    const createdAt = Date.now();

    // Normalized place keys alongside labels
    const place = normalizePlaceFields(input.from, input.to);

    const payload = {
      id: code,
      code,
      from: input.from,
      to: input.to,
      fromKey: place.fromKey,
      toKey: place.toKey,
      date: input.date,
      time: input.time,
      startAt,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email.toLowerCase(),
      status: "pending" as const,
      adults: input.adults,
      babySeat: input.babySeat,
      vehicleType: input.vehicleType ?? null,
      price,
      createdAt,
      updatedAt: createdAt,
      lang: input.lang,
      cancel: { requested: false, reason: null, requestedAt: null, canceledAt: null },
      flightNo: input.flightNo ?? null,
      terminal: input.terminal ?? null,
      baggageCount: input.baggageCount ?? null,
      note: input.note ?? null,
      acceptPolicy: input.acceptPolicy,
      acceptKvkk: input.acceptKvkk,
      acceptComms: input.acceptComms,
    };

    // Atomic write to all 3 collections
    const batch = adminDb.batch();
    batch.set(adminDb.collection("reservations").doc(code), payload);
    batch.set(adminDb.collection("pnr").doc(code), { rid: code, createdAt });
    batch.set(adminDb.collection("reservations_public").doc(code), {
      code,
      email: payload.email,
      status: payload.status,
      from: payload.from,
      to: payload.to,
      fromKey: place.fromKey,
      toKey: place.toKey,
      date: payload.date,
      time: payload.time,
      startAt,
      vehicleType: payload.vehicleType,
      driver: null,
      createdAt,
      updatedAt: createdAt,
    });
    await batch.commit();

    // Audit event (non-blocking)
    logCreated({
      db: adminDb,
      reservationId: code,
      reservationCode: code,
      actorType: "public",
      meta: { from: input.from, to: input.to, vehicleType: input.vehicleType ?? null, price },
    }).catch((e) => console.error("[audit] reservation_created failed:", e));

    // Notifications (non-blocking)
    const tplData = {
      code,
      fullName: payload.fullName,
      from: payload.from,
      to: payload.to,
      date: payload.date,
      time: payload.time,
      adults: payload.adults,
      babySeat: payload.babySeat,
      vehicleType: payload.vehicleType,
      price,
      email: payload.email,
      phone: payload.phone,
      lang: payload.lang,
    };
    // Customer confirmation
    notify({ db: adminDb, type: "reservation_created_customer", data: tplData, triggeredBy: "public" })
      .catch((e) => console.error("[notify] reservation_created_customer failed:", e));
    // Admin alert
    notify({ db: adminDb, type: "reservation_created_admin", data: tplData, triggeredBy: "public", recipientOverride: SITE.email })
      .catch((e) => console.error("[notify] reservation_created_admin failed:", e));

    return NextResponse.json({ id: code, code }, { status: 201 });
  } catch (e: any) {
    console.error("[reservation create]", e);
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 },
    );
  }
}
