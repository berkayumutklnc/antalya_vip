import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { availabilityLimiter, getClientIp } from "@/lib/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  if (!availabilityLimiter.check(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const slotMinutes = Math.max(15, Math.min(480, Number(searchParams.get("slotMinutes")) || 60));

  if (!date || !time) {
    return NextResponse.json({ error: "date and time are required" }, { status: 400 });
  }

  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  if (!y || !m || !d || isNaN(hh) || isNaN(mm)) {
    return NextResponse.json({ error: "Invalid date/time format" }, { status: 400 });
  }
  const startAt = Date.UTC(y, m - 1, d, hh - 3, mm, 0, 0);
  const endAt = startAt + slotMinutes * 60 * 1000;

  const db = getAdminClient();

  // Get all vehicles with their blocked slots
  const { data: vehicles } = await db.from("vehicles").select("id, type");
  const { data: slots } = await db.from("blocked_slots").select("vehicle_id, start_at, end_at");

  const byType: Record<string, { total: number; available: number }> = {};

  for (const v of vehicles ?? []) {
    const vType = String(v.type || "").trim();
    if (!vType) continue;

    if (!byType[vType]) byType[vType] = { total: 0, available: 0 };
    byType[vType].total++;

    const vehicleSlots = (slots ?? []).filter((s: any) => s.vehicle_id === v.id);
    const busy = vehicleSlots.some(
      (s: any) => Number(s.start_at) < endAt && startAt < Number(s.end_at),
    );
    if (!busy) byType[vType].available++;
  }

  const types = Object.entries(byType).map(([type, counts]) => ({
    type,
    available: counts.available > 0,
    availableCount: counts.available,
  }));

  return NextResponse.json({ types });
}
