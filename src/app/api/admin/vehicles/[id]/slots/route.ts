import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/admin/vehicles/[id]/slots — add a blocked slot */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();
    const { id } = await params;
    const body = await req.json();

    const startAt = Number(body.startAt);
    const endAt = Number(body.endAt);
    const reason = typeof body.reason === "string" ? body.reason.trim() : "manual";

    if (!startAt || !endAt || endAt <= startAt) {
      return NextResponse.json({ error: "Invalid startAt/endAt" }, { status: 400 });
    }

    const { data: vehicle } = await db.from("vehicles").select("id").eq("id", id).maybeSingle();
    if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check for overlap
    const { data: existingSlots } = await db
      .from("blocked_slots")
      .select("start_at, end_at")
      .eq("vehicle_id", id);

    const clash = (existingSlots ?? []).some(
      (s: any) => Number(s.start_at) < endAt && startAt < Number(s.end_at),
    );
    if (clash) {
      return NextResponse.json({ error: "Overlaps with existing slot" }, { status: 409 });
    }

    const { data: newSlot } = await db.from("blocked_slots").insert({
      vehicle_id: id,
      start_at: startAt,
      end_at: endAt,
      reason,
    }).select().single();

    return NextResponse.json({ ok: true, slot: newSlot }, { status: 201 });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

/** DELETE /api/admin/vehicles/[id]/slots — remove a blocked slot by index */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();
    const { id } = await params;

    const url = new URL(req.url);
    const idx = Number(url.searchParams.get("index"));
    if (isNaN(idx) || idx < 0) {
      return NextResponse.json({ error: "index query param required" }, { status: 400 });
    }

    const { data: slots } = await db
      .from("blocked_slots")
      .select("id")
      .eq("vehicle_id", id)
      .order("created_at", { ascending: true });

    if (!slots || idx >= slots.length) {
      return NextResponse.json({ error: "Index out of range" }, { status: 400 });
    }

    await db.from("blocked_slots").delete().eq("id", slots[idx].id);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
