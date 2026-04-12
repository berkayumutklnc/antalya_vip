import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
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
    const db = getAdminClient();
    const { rid } = await params;
    const { vehicleId, slotMinutes = 60 } = await req.json();

    if (!vehicleId || typeof vehicleId !== "string") {
      return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
    }

    const [{ data: r }, { data: v }] = await Promise.all([
      db.from("reservations").select("*").eq("code", rid).maybeSingle(),
      db.from("vehicles").select("*").eq("id", vehicleId).maybeSingle(),
    ]);

    if (!r) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    if (!v) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    const guard = canAssignVehicle({
      status: r.status,
      cancel: r.cancel_requested ? { requested: r.cancel_requested } : undefined,
    });
    if (!guard.ok) {
      return NextResponse.json({ error: guard.reason }, { status: 400 });
    }
    assertTransition(r.status, "confirmed");

    const startAt = r.start_at || istToUtcMs(r.date, r.time);
    if (!startAt) return NextResponse.json({ error: "Missing reservation time" }, { status: 400 });
    const endAt = addMinutes(startAt, slotMinutes);

    // Check for overlap
    const { data: existingSlots } = await db
      .from("blocked_slots")
      .select("start_at, end_at")
      .eq("vehicle_id", vehicleId);

    const clash = (existingSlots ?? []).some(
      (s: any) => Number(s.start_at) < endAt && startAt < Number(s.end_at),
    );
    if (clash) {
      return NextResponse.json({ error: "Vehicle busy for this time slot" }, { status: 409 });
    }

    const now = new Date().toISOString();

    // Insert blocked slot
    await db.from("blocked_slots").insert({
      vehicle_id: vehicleId,
      start_at: startAt,
      end_at: endAt,
      reason: "admin-assign",
      reservation_id: rid,
    });

    // Update reservation
    await db.from("reservations").update({
      status: "confirmed",
      vehicle_id: vehicleId,
      vehicle_type: v.type ?? r.vehicle_type ?? null,
      plate: v.plate ?? null,
      driver_name: v.driver_name ?? null,
      driver_phone: v.driver_phone ?? null,
      updated_at: now,
    }).eq("code", rid);

    // Audit events (non-blocking)
    const code = String(r.code ?? rid);
    Promise.all([
      logStatusChanged({
        db, reservationId: rid, reservationCode: code,
        actorType: "admin", actorId: adminUid,
        fromStatus: "pending", toStatus: "confirmed",
      }),
      logVehicleAssigned({
        db, reservationId: rid, reservationCode: code,
        actorType: "admin", actorId: adminUid,
        vehicleId, plate: v.plate,
      }),
    ]).catch((e) => console.error("[audit] assign events failed:", e));

    // Notification (non-blocking)
    notify({
      db,
      type: "vehicle_assigned_customer",
      data: {
        code: r.code ?? rid,
        email: r.email,
        fullName: r.full_name ?? "",
        from: r.from,
        to: r.to,
        date: r.date,
        time: r.time,
        phone: r.phone ?? "",
        driverName: v.driver_name,
        driverPhone: v.driver_phone,
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
