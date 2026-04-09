import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/vehicles — list all vehicles */
export async function GET(req: Request) {
  try {
    await verifyAdminToken(req);
    const db = getAdminDbOrThrow();
    const snap = await db.collection("vehicles").get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
    const db = getAdminDbOrThrow();
    const body = await req.json();

    const { plate, type, driverName, driverPhone } = body ?? {};
    if (!plate || typeof plate !== "string") {
      return NextResponse.json({ error: "plate is required" }, { status: 400 });
    }
    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    const now = Date.now();
    const data = {
      plate: plate.trim(),
      type: type.trim(),
      driverName: typeof driverName === "string" ? driverName.trim() : "",
      driverPhone: typeof driverPhone === "string" ? driverPhone.trim() : "",
      blockedSlots: [],
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection("vehicles").add(data);
    return NextResponse.json({ id: ref.id, ...data }, { status: 201 });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
