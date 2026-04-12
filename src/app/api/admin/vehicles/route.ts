import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/vehicles — list all vehicles */
export async function GET(req: Request) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();
    const { data: vehicles } = await db.from("vehicles").select("*");
    const { data: slots } = await db.from("blocked_slots").select("*");

    const items = (vehicles ?? []).map((v: any) => ({
      id: v.id,
      type: v.type,
      plate: v.plate,
      driverName: v.driver_name,
      driverPhone: v.driver_phone,
      capacity: v.capacity,
      blockedSlots: (slots ?? [])
        .filter((s: any) => s.vehicle_id === v.id)
        .map((s: any) => ({
          startAt: s.start_at,
          endAt: s.end_at,
          reason: s.reason,
          reservationId: s.reservation_id,
          updatedAt: new Date(s.created_at).getTime(),
        })),
      createdAt: new Date(v.created_at).getTime(),
      updatedAt: new Date(v.updated_at).getTime(),
    }));
    return NextResponse.json({ items });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

/** POST /api/admin/vehicles — create a vehicle */
export async function POST(req: Request) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();
    const body = await req.json();

    const { plate, type, driverName, driverPhone } = body ?? {};
    if (!plate || typeof plate !== "string") {
      return NextResponse.json({ error: "plate is required" }, { status: 400 });
    }
    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    const data = {
      plate: plate.trim(),
      type: type.trim(),
      driver_name: typeof driverName === "string" ? driverName.trim() : "",
      driver_phone: typeof driverPhone === "string" ? driverPhone.trim() : "",
    };

    const { data: created, error } = await db.from("vehicles").insert(data).select().single();
    if (error) throw new Error(error.message);

    return NextResponse.json({
      id: created.id,
      plate: created.plate,
      type: created.type,
      driverName: created.driver_name,
      driverPhone: created.driver_phone,
      blockedSlots: [],
      createdAt: new Date(created.created_at).getTime(),
      updatedAt: new Date(created.updated_at).getTime(),
    }, { status: 201 });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
