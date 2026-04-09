import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { isValidStatus, canAdminSetStatus, type ReservationStatus } from "@/lib/domain/reservationStatus";
import { logStatusChanged } from "@/lib/server/reservationEvents";
import { istToUtcMs, addMinutes } from "@/utils/time";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLOT_MINUTES = 60;

export async function PATCH(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    const adminUid = await verifyAdminToken(req);
    const adminDb = getAdminDbOrThrow();

    const { status } = await req.json();
    if (!isValidStatus(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { rid } = await params;
    const rRef = adminDb.collection("reservations").doc(rid);
    const rSnap = await rRef.get();
    if (!rSnap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const r = rSnap.data() as any;
    const currentStatus = r.status as ReservationStatus;

    // Domain guard
    const guard = canAdminSetStatus({ status: currentStatus, cancel: r.cancel }, status);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.reason }, { status: 409 });
    }

    // Compute the slot range for this reservation (unified startAt/endAt logic)
    const startAt = r.startAt || istToUtcMs(r.date, r.time);
    const endAt = addMinutes(startAt, SLOT_MINUTES);

    if (status === "confirmed") {
      // Auto-assign: find a free vehicle of matching type
      const type = String(r.vehicleType || "").trim().toLowerCase();
      const all = await adminDb.collection("vehicles").get();
      const candidates = all.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .filter(v => String(v.type || "").trim().toLowerCase() === type);

      const picked = candidates.find(v => {
        const slots: any[] = Array.isArray(v.blockedSlots) ? v.blockedSlots : [];
        return !slots.some((s: any) => Number(s.startAt) < endAt && startAt < Number(s.endAt));
      });

      if (!picked) {
        return NextResponse.json({ error: "No available vehicle for this slot" }, { status: 409 });
      }

      const vRef = adminDb.collection("vehicles").doc(picked.id);
      await adminDb.runTransaction(async (tx) => {
        const freshV = await tx.get(vRef);
        const data = freshV.data() as any;
        const slots: any[] = Array.isArray(data?.blockedSlots) ? data.blockedSlots : [];
        const busy = slots.some((s: any) => Number(s.startAt) < endAt && startAt < Number(s.endAt));
        if (busy) throw new Error("Vehicle just became unavailable");

        const newSlot = { startAt, endAt, reason: "admin-status", reservationId: rid, updatedAt: Date.now() };
        tx.update(vRef, { blockedSlots: [...slots, newSlot], updatedAt: Date.now() });
        tx.update(rRef, {
          status: "confirmed",
          vehicleId: picked.id,
          plate: picked.plate || "",
          driverName: picked.driverName || "",
          driverPhone: picked.driverPhone || "",
          updatedAt: Date.now(),
        });
      });

      logStatusChanged({
        db: adminDb, reservationId: rid, reservationCode: String(r.code ?? rid),
        actorType: "admin", actorId: adminUid,
        fromStatus: currentStatus, toStatus: "confirmed",
        meta: { assignedVehicleId: picked.id },
      }).catch((e) => console.error("[audit] status_changed failed:", e));

      return NextResponse.json({ ok: true, assignedVehicleId: picked.id });
    }

    if (status === "canceled") {
      // Release blocked slot if vehicle was assigned
      const vId = r.vehicleId;
      if (vId && startAt) {
        const vRef = adminDb.collection("vehicles").doc(vId);
        await adminDb.runTransaction(async (tx) => {
          const freshV = await tx.get(vRef);
          const data = freshV.data() as any;
          const slots: any[] = Array.isArray(data?.blockedSlots) ? data.blockedSlots : [];
          // Remove slot matching this reservation's time range
          const filtered = slots.filter((s: any) => {
            if (s.reservationId === rid) return false;
            return !(Number(s.startAt) === startAt && Number(s.endAt) === endAt);
          });
          tx.update(vRef, { blockedSlots: filtered, updatedAt: Date.now() });
          tx.update(rRef, { status: "canceled", updatedAt: Date.now() });
        });
      } else {
        await rRef.update({ status: "canceled", updatedAt: Date.now() });
      }

      logStatusChanged({
        db: adminDb, reservationId: rid, reservationCode: String(r.code ?? rid),
        actorType: "admin", actorId: adminUid,
        fromStatus: currentStatus, toStatus: "canceled",
      }).catch((e) => console.error("[audit] status_changed failed:", e));

      return NextResponse.json({ ok: true });
    }

    // For completed / no_show — just update status, leave slot in place (historical record)
    await rRef.update({ status, updatedAt: Date.now() });

    logStatusChanged({
      db: adminDb, reservationId: rid, reservationCode: String(r.code ?? rid),
      actorType: "admin", actorId: adminUid,
      fromStatus: currentStatus, toStatus: status,
    }).catch((e) => console.error("[audit] status_changed failed:", e));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
