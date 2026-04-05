import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
const adminDb = getAdminDbOrThrow();
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const typeParam = (searchParams.get("type") || "").trim().toLowerCase();

  if (!date || !time || !typeParam) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }
  const vSnap = await adminDb.collection("vehicles").get();
  const vehiclesAll = vSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  const norm = (s: any) => String(s ?? "").trim().toLowerCase();
  const vehicles = vehiclesAll.filter(v => norm(v.type) === typeParam);
  const capacity = vehicles.length;

  const rSnap = await adminDb
    .collection("reservations")
    .where("date", "==", date)
    .where("time", "==", time)
    .where("vehicleType", "==", typeParam)
    .where("status", "in", ["pending", "confirmed"])
    .get();

  const reservedCount = rSnap.size;
  const availableCount = Math.max(0, capacity - reservedCount);

  return NextResponse.json({
    type: typeParam,
    capacity,
    reservedCount,
    availableCount,
  });
}
