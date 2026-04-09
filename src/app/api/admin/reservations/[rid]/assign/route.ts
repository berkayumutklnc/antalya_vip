import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { canAssignVehicle, assertTransition } from "@/lib/domain/reservationStatus";
import { logVehicleAssigned, logStatusChanged } from "@/lib/server/reservationEvents";
import { notify } from "@/lib/server/notifications";
import { istToUtcMs, addMinutes } from "@/utils/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    const adminUid = await verifyAdminToken(req);
    const adminDb = getAdminDbOrThrow();
    const { rid } = await params;
    const { vehicleId, slotMinutes = 60 } = await req.json();

    if (!vehicleId || typeof vehicleId !== "string") {
      return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
    }

    const rRef = adminDb.collection("reservations").doc(rid);
    const vRef = adminDb.collection("vehicles").doc(vehicleId);

    const [rSnap, vSnap] = await Promise.all([rRef.get(), vRef.get()]);
    if (!rSnap.exists) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    if (!vSnap.exists) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    const r = rSnap.data()!;
    const v = vSnap.data()!;

    // Domain guard
    const guard = canAssignVehicle({ status: r.status, cancel: r.cancel });
    if (!guard.ok) {
      return NextResponse.json({ error: guard.reason }, { status: 400 });
    }
    assertTransition(r.status, "confirmed");

    const startAt = r.startAt || istToUtcMs(r.date, r.time);
    if (!startAt) return NextResponse.json({ error: "Missing reservation time" }, { status: 400 });
    const endAt = addMinutes(startAt, slotMinutes);

    const slots: any[] = Array.isArray(v.blockedSlots) ? v.blockedSlots : [];
    const clash = slots.some((s: any) =>
      Number(s.startAt) < endAt && startAt < Number(s.endAt),
    );
    if (clash) {
      return NextResponse.json({ error: "Vehicle busy for this time slot" }, { status: 409 });
    }

    const now = Date.now();
    const newSlot = {
      startAt,
      endAt,
      reason: "admin-assign",
      reservationId: rid,
      driverName: v.driverName ?? null,
      driverPhone: v.driverPhone ?? null,
      plate: v.plate ?? null,
      type: v.type ?? null,
      updatedAt: now,
    };

    const batch = adminDb.batch();

    batch.update(rRef, {
      status: "confirmed",
      vehicleId: vehicleId,
      vehicleType: v.type ?? r.vehicleType ?? null,
      plate: v.plate ?? null,
      driverName: v.driverName ?? null,
      driverPhone: v.driverPhone ?? null,
      updatedAt: now,
    });

    batch.update(vRef, {
      blockedSlots: [...slots, newSlot],
      updatedAt: now,
    });

    const pubRef = adminDb.collection("reservations_public").doc(rid);
    batch.set(
      pubRef,
      {
        code: r.code ?? r.id ?? rid,
        email: r.email,
        status: "confirmed",
        from: r.from,
        to: r.to,
        date: r.date,
        time: r.time,
        startAt,
        vehicleType: v.type ?? r.vehicleType ?? null,
        driver: {
          name: v.driverName ?? null,
          phone: v.driverPhone ?? null,
          plate: v.plate ?? null,
        },
        updatedAt: now,
      },
      { merge: true },
    );

    await batch.commit();

    // Audit events (non-blocking)
    const code = String(r.code ?? rid);
    Promise.all([
      logStatusChanged({
        db: adminDb, reservationId: rid, reservationCode: code,
        actorType: "admin", actorId: adminUid,
        fromStatus: "pending", toStatus: "confirmed",
      }),
      logVehicleAssigned({
        db: adminDb, reservationId: rid, reservationCode: code,
        actorType: "admin", actorId: adminUid,
        vehicleId, plate: v.plate,
      }),
    ]).catch((e) => console.error("[audit] assign events failed:", e));

    // Notification (non-blocking)
    notify({
      db: adminDb,
      type: "vehicle_assigned_customer",
      data: {
        code: r.code ?? rid,
        email: r.email,
        fullName: r.fullName ?? "",
        from: r.from,
        to: r.to,
        date: r.date,
        time: r.time,
        phone: r.phone ?? "",
        driverName: v.driverName,
        driverPhone: v.driverPhone,
        plate: v.plate,
      },
      triggeredBy: "admin",
      triggeredById: adminUid,
    }).catch((e) => console.error("[notify] vehicle_assigned_customer failed:", e));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e?.name === "TransitionError") {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error("[admin assign]", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
