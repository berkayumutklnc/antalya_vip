import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
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
    const db = getAdminClient();

    const { status } = await req.json();
    if (!isValidStatus(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { rid } = await params;
    const { data: r } = await db.from("reservations").select("*").eq("code", rid).maybeSingle();
    if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentStatus = r.status as ReservationStatus;

    const guard = canAdminSetStatus(
      { status: currentStatus, cancel: r.cancel_requested ? { requested: r.cancel_requested } : undefined },
      status,
    );
    if (!guard.ok) {
      return NextResponse.json({ error: guard.reason }, { status: 409 });
    }

    const startAt = r.start_at || istToUtcMs(r.date, r.time);
    const endAt = addMinutes(startAt, SLOT_MINUTES);

    if (status === "confirmed") {
      const type = String(r.vehicle_type || "").trim().toLowerCase();
      const { data: allVehicles } = await db.from("vehicles").select("*");
      const candidates = (allVehicles ?? []).filter(
        (v: any) => String(v.type || "").trim().toLowerCase() === type,
      );

      // Find a free vehicle
      let picked: any = null;
      for (const v of candidates) {
        const { data: slots } = await db
          .from("blocked_slots")
          .select("start_at, end_at")
          .eq("vehicle_id", v.id);
        const busy = (slots ?? []).some(
          (s: any) => Number(s.start_at) < endAt && startAt < Number(s.end_at),
        );
        if (!busy) {
          picked = v;
          break;
        }
      }

      if (!picked) {
        return NextResponse.json({ error: "No available vehicle for this slot" }, { status: 409 });
      }

      // Insert blocked slot
      await db.from("blocked_slots").insert({
        vehicle_id: picked.id,
        start_at: startAt,
        end_at: endAt,
        reason: "admin-status",
        reservation_id: rid,
      });

      // Update reservation
      await db.from("reservations").update({
        status: "confirmed",
        vehicle_id: picked.id,
        plate: picked.plate || "",
        driver_name: picked.driver_name || "",
        driver_phone: picked.driver_phone || "",
        updated_at: new Date().toISOString(),
      }).eq("code", rid);

      logStatusChanged({
        db, reservationId: rid, reservationCode: String(r.code ?? rid),
        actorType: "admin", actorId: adminUid,
        fromStatus: currentStatus, toStatus: "confirmed",
        meta: { assignedVehicleId: picked.id },
      }).catch((e) => console.error("[audit] status_changed failed:", e));

      return NextResponse.json({ ok: true, assignedVehicleId: picked.id });
    }

    if (status === "canceled") {
      const vId = r.vehicle_id;
      if (vId && startAt) {
        // Remove blocked slot
        await db.from("blocked_slots").delete()
          .eq("vehicle_id", vId)
          .eq("reservation_id", rid);
      }

      await db.from("reservations").update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      }).eq("code", rid);

      logStatusChanged({
        db, reservationId: rid, reservationCode: String(r.code ?? rid),
        actorType: "admin", actorId: adminUid,
        fromStatus: currentStatus, toStatus: "canceled",
      }).catch((e) => console.error("[audit] status_changed failed:", e));

      return NextResponse.json({ ok: true });
    }

    // For completed / no_show
    await db.from("reservations").update({
      status,
      updated_at: new Date().toISOString(),
    }).eq("code", rid);

    logStatusChanged({
      db, reservationId: rid, reservationCode: String(r.code ?? rid),
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
