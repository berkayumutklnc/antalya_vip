import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/vehicles/[id] — single vehicle */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();
    const { id } = await params;

    const { data: v } = await db.from("vehicles").select("*").eq("id", id).maybeSingle();
    if (!v) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: slots } = await db.from("blocked_slots").select("*").eq("vehicle_id", id);

    return NextResponse.json({
      id: v.id,
      type: v.type,
      plate: v.plate,
      driverName: v.driver_name,
      driverPhone: v.driver_phone,
      capacity: v.capacity,
      blockedSlots: (slots ?? []).map((s: any) => ({
        startAt: s.start_at,
        endAt: s.end_at,
        reason: s.reason,
        reservationId: s.reservation_id,
        updatedAt: new Date(s.created_at).getTime(),
      })),
      createdAt: new Date(v.created_at).getTime(),
      updatedAt: new Date(v.updated_at).getTime(),
    });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

/** PATCH /api/admin/vehicles/[id] — update vehicle fields */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();
    const { id } = await params;
    const body = await req.json();

    const { data: existing } = await db.from("vehicles").select("id").eq("id", id).maybeSingle();
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const fieldMap: Record<string, string> = {
      plate: "plate",
      type: "type",
      driverName: "driver_name",
      driverPhone: "driver_phone",
    };
    for (const [clientKey, dbKey] of Object.entries(fieldMap)) {
      if (clientKey in body && typeof body[clientKey] === "string") {
        patch[dbKey] = body[clientKey].trim();
      }
    }

    await db.from("vehicles").update(patch).eq("id", id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

/** DELETE /api/admin/vehicles/[id] — delete vehicle */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();
    const { id } = await params;

    const { data: existing } = await db.from("vehicles").select("id").eq("id", id).maybeSingle();
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.from("vehicles").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
