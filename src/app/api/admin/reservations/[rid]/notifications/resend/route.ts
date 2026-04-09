import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { notify } from "@/lib/server/notifications";
import { isValidNotificationType } from "@/lib/server/notificationTemplates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/reservations/[rid]/notifications/resend
 *
 * Body: { type: NotificationType }
 *
 * Resends a notification for the given reservation.
 * Skips dedup so the admin can force-resend.
 */
export async function POST(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    const adminUid = await verifyAdminToken(req);
    const adminDb = getAdminDbOrThrow();
    const { rid } = await params;

    const { type } = await req.json();
    if (!type || !isValidNotificationType(type)) {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    // Fetch reservation
    const rSnap = await adminDb.collection("reservations").doc(rid).get();
    if (!rSnap.exists) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const r = rSnap.data()!;

    const result = await notify({
      db: adminDb,
      type,
      data: {
        code: String(r.code ?? rid),
        email: r.email ?? "",
        fullName: r.fullName ?? "-",
        from: r.from ?? "",
        to: r.to ?? "",
        date: r.date ?? "",
        time: r.time ?? "",
        phone: r.phone ?? "",
        adults: r.adults,
        babySeat: r.babySeat,
        vehicleType: r.vehicleType,
        price: r.price,
        lang: r.lang,
        driverName: r.driverName,
        driverPhone: r.driverPhone,
        plate: r.plate,
      },
      triggeredBy: "admin",
      triggeredById: adminUid,
      skipDedupe: true,
    });

    return NextResponse.json({ ok: result.sent, result });
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: (e as AuthError).message }, { status: (e as AuthError).status });
    }
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin resend notification]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
