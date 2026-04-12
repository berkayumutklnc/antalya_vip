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

  const db = getAdminClient();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const typeParam = (searchParams.get("type") || "").trim().toLowerCase();

  if (!date || !time || !typeParam) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const { data: vehiclesAll } = await db.from("vehicles").select("id, type");
  const vehicles = (vehiclesAll ?? []).filter(
    (v: any) => String(v.type ?? "").trim().toLowerCase() === typeParam,
  );
  const capacity = vehicles.length;

  const { data: reservations } = await db
    .from("reservations")
    .select("code")
    .eq("date", date)
    .eq("time", time)
    .eq("vehicle_type", typeParam)
    .in("status", ["pending", "confirmed"]);

  const reservedCount = reservations?.length ?? 0;
  const availableCount = Math.max(0, capacity - reservedCount);

  return NextResponse.json({
    type: typeParam,
    capacity,
    reservedCount,
    availableCount,
  });
}
