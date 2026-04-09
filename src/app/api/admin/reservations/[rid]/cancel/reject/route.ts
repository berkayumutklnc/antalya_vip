import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { canRejectCancel } from "@/lib/domain/reservationStatus";
import { logCancelRejected } from "@/lib/server/reservationEvents";
import { notify } from "@/lib/server/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    const adminUid = await verifyAdminToken(req);
    const adminDb = getAdminDbOrThrow();
    const { rid } = await params;

    const rRef = adminDb.collection("reservations").doc(rid);
    const rSnap = await rRef.get();
    if (!rSnap.exists) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });

    const r = rSnap.data()!;

    // Domain guard
    const guard = canRejectCancel({ status: r.status, cancel: r.cancel });
    if (!guard.ok) {
      return NextResponse.json({ error: guard.reason }, { status: 400 });
    }

    await rRef.update({
      cancel: {
        requested: false,
        reason: r.cancel?.reason ?? null,
        requestedAt: r.cancel?.requestedAt ?? null,
        canceledAt: null,
      },
      updatedAt: Date.now(),
    });

    // Audit event (non-blocking)
    logCancelRejected({
      db: adminDb,
      reservationId: rid,
      reservationCode: String(r.code ?? rid),
      actorType: "admin",
      actorId: adminUid,
    }).catch((e) => console.error("[audit] cancel_rejected failed:", e));

    // Notification to customer (non-blocking)
    notify({
      db: adminDb,
      type: "cancel_rejected_customer",
      data: {
        code: String(r.code ?? rid),
        email: r.email ?? "",
        fullName: r.fullName ?? "-",
        from: r.from ?? "",
        to: r.to ?? "",
        date: r.date ?? "",
        time: r.time ?? "",
        phone: r.phone ?? "",
      },
      triggeredBy: "admin",
      triggeredById: adminUid,
    }).catch((e) => console.error("[notify] cancel_rejected_customer failed:", e));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[admin reject cancel]", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
