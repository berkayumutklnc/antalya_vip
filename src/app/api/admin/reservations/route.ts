import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();

    const { data: items } = await db
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    const mapped = (items ?? []).map((d: any) => ({
      rid: d.code,
      id: d.code,
      code: d.code,
      status: d.status,
      from: d.from,
      to: d.to,
      fromKey: d.from_key,
      toKey: d.to_key,
      date: d.date,
      time: d.time,
      startAt: d.start_at,
      fullName: d.full_name,
      email: d.email,
      phone: d.phone,
      adults: d.adults,
      babySeat: d.baby_seat,
      vehicleType: d.vehicle_type,
      serviceTypeId: d.service_type_id ?? null,
      serviceVariantKey: d.service_variant_key ?? null,
      vehicleId: d.vehicle_id,
      plate: d.plate,
      driverName: d.driver_name,
      driverPhone: d.driver_phone,
      price: d.price,
      quotedBasePrice: d.quoted_base_price ?? null,
      variantSurcharge: d.variant_surcharge ?? null,
      quotedTotalPrice: d.quoted_total_price ?? null,
      currency: d.currency ?? null,
      lang: d.lang,
      cancel: d.cancel_requested ? {
        requested: d.cancel_requested,
        reason: d.cancel_reason,
        requestedAt: d.cancel_requested_at,
        canceledAt: d.cancel_canceled_at,
      } : { requested: false, reason: null, requestedAt: null, canceledAt: null },
      flightNo: d.flight_no,
      terminal: d.terminal,
      baggageCount: d.baggage_count,
      note: d.note,
      acceptPolicy: d.accept_policy,
      acceptKvkk: d.accept_kvkk,
      acceptComms: d.accept_comms,
      createdAt: new Date(d.created_at).getTime(),
      updatedAt: new Date(d.updated_at).getTime(),
    }));

    return NextResponse.json({ items: mapped });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}
