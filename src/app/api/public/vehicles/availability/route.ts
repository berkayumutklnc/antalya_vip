import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { availabilityLimiter, getClientIp } from "@/lib/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/public/vehicles/availability
 *
 * Returns availability per vehicle type for a given date/time slot.
 * No sensitive vehicle data is exposed — only type + available boolean.
 *
 * Query params: date (YYYY-MM-DD), time (HH:mm), slotMinutes (optional, default 60)
 */
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

  // Parse date/time to UTC ms (Turkey local = UTC+3)
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  if (!y || !m || !d || isNaN(hh) || isNaN(mm)) {
    return NextResponse.json({ error: "Invalid date/time format" }, { status: 400 });
  }
  const startAt = Date.UTC(y, m - 1, d, hh - 3, mm, 0, 0);
  const endAt = startAt + slotMinutes * 60 * 1000;

  const db = getAdminDbOrThrow();
  const snap = await db.collection("vehicles").get();

  // Group vehicles by type, check availability
  const byType: Record<string, { total: number; available: number }> = {};

  for (const doc of snap.docs) {
    const v = doc.data();
    const vType = String(v.type || "").trim();
    if (!vType) continue;

    if (!byType[vType]) byType[vType] = { total: 0, available: 0 };
    byType[vType].total++;

    const slots: any[] = Array.isArray(v.blockedSlots) ? v.blockedSlots : [];
    const busy = slots.some(
      (s: any) => Number(s.startAt) < endAt && startAt < Number(s.endAt),
    );
    if (!busy) byType[vType].available++;
  }

  // Return only type + availability (no plates, drivers, IDs)
  const types = Object.entries(byType).map(([type, counts]) => ({
    type,
    available: counts.available > 0,
    availableCount: counts.available,
  }));

  return NextResponse.json({ types });
}
