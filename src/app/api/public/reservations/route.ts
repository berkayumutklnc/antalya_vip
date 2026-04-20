import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { CreateReservationSchema } from "@/lib/validation/reservation";
import { validateBookingEligibility } from "@/lib/server/bookingGuard";
import { computeQuotedPrice } from "@/lib/server/pricing";
import { istToUtcMs } from "@/utils/time";
import { generateUniquePNR } from "@/lib/server/pnr";
import { normalizePlaceFields } from "@/lib/domain/places";
import { logCreated } from "@/lib/server/reservationEvents";
import { notify, notifyTelegram } from "@/lib/server/notifications";
import { SITE } from "@/config/site";
import { reservationCreateLimiter, getClientIp } from "@/lib/server/rateLimit";

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

    // ── Gate 1: Service type + variant eligibility ──────────────
    const guard = await validateBookingEligibility(
      db,
      input.serviceTypeId,
      input.vehicleType,
      input.serviceVariantKey,
    );
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const place = normalizePlaceFields(input.from, input.to);

    // ── Gate 2: Price must resolve ──────────────────────────────
    if (!place.fromKey || !place.toKey) {
      return NextResponse.json(
        { error: "Could not resolve route for pricing" },
        { status: 400 },
      );
    }

    const quote = await computeQuotedPrice(
      db,
      place.fromKey,
      place.toKey,
      guard.serviceTypeId,
      guard.serviceVariantKey,
    );

    if (
      quote.quotedBasePrice == null ||
      quote.quotedTotalPrice == null ||
      !Number.isFinite(quote.quotedBasePrice) ||
      !Number.isFinite(quote.variantSurcharge) ||
      !Number.isFinite(quote.quotedTotalPrice)
    ) {
      return NextResponse.json(
        { error: "Price could not be determined for this route and service type" },
        { status: 400 },
      );
    }

    const startAt = istToUtcMs(input.date, input.time);
    const code = await generateUniquePNR(db);
    const now = new Date().toISOString();

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
      vehicle_type: input.vehicleType ?? guard.serviceTypeId,
      service_type_id: guard.serviceTypeId,
      service_variant_key: guard.serviceVariantKey,
      price: quote.quotedTotalPrice,
      quoted_base_price: quote.quotedBasePrice,
      variant_surcharge: quote.variantSurcharge,
      quoted_total_price: quote.quotedTotalPrice,
      currency: quote.currency,
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
      meta: { from: input.from, to: input.to, vehicleType: input.vehicleType ?? null, price: quote.quotedTotalPrice },
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
      price: quote.quotedTotalPrice,
      email: input.email.toLowerCase(),
      phone: input.phone,
      lang: input.lang,
    };
    notify({ db, type: "reservation_created_customer", data: tplData, triggeredBy: "public" })
      .catch((e) => console.error("[notify] reservation_created_customer failed:", e));
    notify({ db, type: "reservation_created_admin", data: tplData, triggeredBy: "public", recipientOverride: SITE.email })
      .catch((e) => console.error("[notify] reservation_created_admin failed:", e));
    notifyTelegram({ db, type: "reservation_created_admin", data: tplData, triggeredBy: "public" })
      .catch((e) => console.error("[notifyTelegram] reservation_created_admin failed:", e));

    return NextResponse.json({ id: code, code }, { status: 201 });
  } catch (e: any) {
    console.error("[reservation create]", e);
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 },
    );
  }
}
