import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { notify } from "@/lib/server/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/admin/reservations/[rid]/notifications/resend — resend notification */
export async function POST(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    const adminUid = await verifyAdminToken(req);
    const db = getAdminClient();
    const { rid } = await params;

    const body = await req.json().catch(() => ({}));
    const type = body.type; // e.g. "reservation_confirmed", "reservation_assigned"

    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    // Fetch reservation by code (consistent with other admin routes)
    const { data: reservation, error: fetchErr } = await db
      .from("reservations")
      .select("*")
      .eq("code", rid)
      .maybeSingle();

    if (fetchErr || !reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const result = await notify({
      db,
      type,
      data: {
        code: reservation.code,
        fullName: reservation.full_name,
        email: reservation.email,
        phone: reservation.phone,
        from: reservation.from ?? "",
        to: reservation.to ?? "",
        date: reservation.date,
        time: reservation.time,
        adults: reservation.adults ?? undefined,
        babySeat: reservation.baby_seat ?? undefined,
        vehicleType: reservation.vehicle_type,
        price: reservation.price ?? undefined,
        plate: reservation.plate ?? "",
        driverName: reservation.driver_name ?? "",
        driverPhone: reservation.driver_phone ?? "",
      },
      triggeredBy: "admin",
      triggeredById: adminUid,
      skipDedupe: true,
    });

    return NextResponse.json({ ok: result.sent, result });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
