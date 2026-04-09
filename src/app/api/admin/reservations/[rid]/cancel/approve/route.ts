import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { canApproveCancel } from "@/lib/domain/reservationStatus";
import { logCancelApproved, logStatusChanged } from "@/lib/server/reservationEvents";
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
    const guard = canApproveCancel({ status: r.status, cancel: r.cancel });
    if (!guard.ok) {
      return NextResponse.json({ error: guard.reason }, { status: 400 });
    }

    const now = Date.now();
    const prevStatus = String(r.status);

    // Use transaction to atomically release vehicle slot + update reservation
    await adminDb.runTransaction(async (tx) => {
      // Release vehicle slot if assigned
      if (r.vehicleId) {
        const vRef = adminDb.collection("vehicles").doc(r.vehicleId);
        const vSnap = await tx.get(vRef);
        if (vSnap.exists) {
          const v = vSnap.data()!;
          const slots: any[] = Array.isArray(v.blockedSlots) ? v.blockedSlots : [];
          const filtered = slots.filter((s: any) => s.reservationId !== rid);
          tx.update(vRef, { blockedSlots: filtered, updatedAt: now });
        }
      }

      tx.update(rRef, {
        status: "canceled",
        cancel: {
          requested: false,
          reason: r.cancel?.reason ?? null,
          requestedAt: r.cancel?.requestedAt ?? null,
          canceledAt: now,
        },
        updatedAt: now,
      });

      const pubRef = adminDb.collection("reservations_public").doc(rid);
      tx.update(pubRef, {
        status: "canceled",
        driver: null,
        updatedAt: now,
      });
    });

    // Audit events (non-blocking)
    const code = String(r.code ?? rid);
    Promise.all([
      logCancelApproved({
        db: adminDb, reservationId: rid, reservationCode: code,
        actorType: "admin", actorId: adminUid,
      }),
      logStatusChanged({
        db: adminDb, reservationId: rid, reservationCode: code,
        actorType: "admin", actorId: adminUid,
        fromStatus: prevStatus, toStatus: "canceled",
      }),
    ]).catch((e) => console.error("[audit] cancel approve events failed:", e));

    // Notification to customer (non-blocking)
    notify({
      db: adminDb,
      type: "cancel_approved_customer",
      data: {
        code,
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
