import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
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
    const db = getAdminClient();

    const price = input.vehicleType
      ? getPrice(input.from, input.to, input.vehicleType as VehicleType)
      : null;

    const startAt = istToUtcMs(input.date, input.time);
    const code = await generateUniquePNR(db);
    const now = new Date().toISOString();
    const place = normalizePlaceFields(input.from, input.to);

    const payload = {
      code,
      from: input.from,
      to: input.to,
      from_key: place.fromKey,
      to_key: place.toKey,
      date: input.date,
      time: input.time,
      start_at: startAt,
      full_name: input.fullName,
      phone: input.phone,
      email: input.email.toLowerCase(),
      status: "pending" as const,
      adults: input.adults,
      baby_seat: input.babySeat,
      vehicle_type: input.vehicleType ?? null,
      price,
      lang: input.lang,
      cancel_requested: false,
      cancel_reason: null,
      cancel_requested_at: null,
      cancel_canceled_at: null,
      flight_no: input.flightNo ?? null,
      terminal: input.terminal ?? null,
      baggage_count: input.baggageCount ?? null,
      note: input.note ?? null,
      accept_policy: input.acceptPolicy,
      accept_kvkk: input.acceptKvkk,
      accept_comms: input.acceptComms,
    };

    const { error } = await db.from("reservations").insert(payload);
    if (error) throw new Error(error.message);

    // Audit event (non-blocking)
    logCreated({
      db,
      reservationId: code,
      reservationCode: code,
      actorType: "public",
      meta: { from: input.from, to: input.to, vehicleType: input.vehicleType ?? null, price },
    }).catch((e) => console.error("[audit] reservation_created failed:", e));

    // Notifications (non-blocking)
    const tplData = {
      code,
      fullName: input.fullName,
      from: input.from,
      to: input.to,
      date: input.date,
      time: input.time,
      adults: input.adults,
      babySeat: input.babySeat,
      vehicleType: input.vehicleType,
      price,
      email: input.email.toLowerCase(),
      phone: input.phone,
      lang: input.lang,
    };
    notify({ db, type: "reservation_created_customer", data: tplData, triggeredBy: "public" })
      .catch((e) => console.error("[notify] reservation_created_customer failed:", e));
    notify({ db, type: "reservation_created_admin", data: tplData, triggeredBy: "public", recipientOverride: SITE.email })
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
