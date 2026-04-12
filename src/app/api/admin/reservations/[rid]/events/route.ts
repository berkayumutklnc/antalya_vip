import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/reservations/[rid]/events — fetch audit events for a reservation */
export async function GET(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();
    const { rid } = await params;

    const { data } = await db
      .from("reservation_events")
      .select("*")
      .eq("reservation_id", rid)
      .order("created_at", { ascending: true });

    const events = (data ?? []).map((d: any) => ({
      id: d.id,
      reservationId: d.reservation_id,
      reservationCode: d.reservation_code,
      type: d.type,
      actorType: d.actor_type,
      actorId: d.actor_id,
      meta: d.meta,
      timestamp: new Date(d.created_at).getTime(),
    }));

    return NextResponse.json({ events });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
