import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { canApproveCancel } from "@/lib/domain/reservationStatus";
import { logCancelApproved, logStatusChanged } from "@/lib/server/reservationEvents";
import { notify } from "@/lib/server/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    const adminUid = await verifyAdminToken(req);
    const db = getAdminClient();
    const { rid } = await params;

    const { data: r } = await db.from("reservations").select("*").eq("code", rid).maybeSingle();
    if (!r) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });

    const guard = canApproveCancel({
      status: r.status,
      cancel: r.cancel_requested ? { requested: r.cancel_requested } : undefined,
    });
    if (!guard.ok) {
      return NextResponse.json({ error: guard.reason }, { status: 400 });
    }

    const now = Date.now();
    const prevStatus = String(r.status);

    // Release vehicle slot if assigned
    if (r.vehicle_id) {
      await db.from("blocked_slots").delete()
        .eq("vehicle_id", r.vehicle_id)
        .eq("reservation_id", rid);
    }

    // Update reservation
    await db.from("reservations").update({
      status: "canceled",
      cancel_requested: false,
      cancel_canceled_at: now,
      updated_at: new Date().toISOString(),
    }).eq("code", rid);

    // Audit events (non-blocking)
    const code = String(r.code ?? rid);
    Promise.all([
      logCancelApproved({
        db, reservationId: rid, reservationCode: code,
        actorType: "admin", actorId: adminUid,
      }),
      logStatusChanged({
        db, reservationId: rid, reservationCode: code,
        actorType: "admin", actorId: adminUid,
        fromStatus: prevStatus, toStatus: "canceled",
      }),
    ]).catch((e) => console.error("[audit] cancel approve events failed:", e));

    // Notification to customer (non-blocking)
    notify({
      db,
      type: "cancel_approved_customer",
      data: {
        code,
        email: r.email ?? "",
        fullName: r.full_name ?? "-",
        from: r.from ?? "",
        to: r.to ?? "",
        date: r.date ?? "",
        time: r.time ?? "",
        phone: r.phone ?? "",
      },
      triggeredBy: "admin",
      triggeredById: adminUid,
    }).catch((e) => console.error("[notify] cancel_approved_customer failed:", e));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[admin approve cancel]", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
