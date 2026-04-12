import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/admin/tools/reset — danger zone operations */
export async function POST(req: Request) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();
    const { action } = await req.json();

    switch (action) {
      case "purge_reservations": {
        // Delete all reservation_events first (FK)
        await db.from("reservation_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        // Delete all notification_logs
        await db.from("notification_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        // Delete all blocked_slots
        await db.from("blocked_slots").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        // Delete all reservations
        const { data } = await db.from("reservations").select("id");
        const count = data?.length ?? 0;
        await db.from("reservations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        return NextResponse.json({ ok: true, deleted: count });
      }

      case "reset_vehicle_blocks": {
        const { data } = await db.from("blocked_slots").select("id");
        const count = data?.length ?? 0;
        await db.from("blocked_slots").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        return NextResponse.json({ ok: true, deleted: count });
      }

      case "seed_vehicles": {
        const now = new Date().toISOString();
        const seeds = [
          { type: "vip-6", plate: "07 VIP 001", driver_name: "Ali Genç", driver_phone: "+905550000001", created_at: now, updated_at: now },
          { type: "vip-6", plate: "34 TL 5416", driver_name: "Berkay Umut KILINÇ", driver_phone: "+905550000002", created_at: now, updated_at: now },
          { type: "vip-10", plate: "07 ABC 101", driver_name: "Mehmet Kaya", driver_phone: "+905550000003", created_at: now, updated_at: now },
          { type: "vip-16", plate: "07 ABC 201", driver_name: "Mehmet Kaya", driver_phone: "+905550000003", created_at: now, updated_at: now },
        ];
        const { data } = await db.from("vehicles").insert(seeds).select("id");
        return NextResponse.json({ ok: true, created: data?.length ?? 0 });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
