import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/vehicles/[id] — single vehicle */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminToken(req);
    const db = getAdminDbOrThrow();
    const { id } = await params;
    const snap = await db.collection("vehicles").doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ id: snap.id, ...snap.data() });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

/** PATCH /api/admin/vehicles/[id] — update vehicle fields */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminToken(req);
    const db = getAdminDbOrThrow();
    const { id } = await params;
    const body = await req.json();

    const ref = db.collection("vehicles").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const allowed = ["plate", "type", "driverName", "driverPhone"] as const;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const key of allowed) {
      if (key in body && typeof body[key] === "string") {
        patch[key] = body[key].trim();
      }
    }

    await ref.update(patch);
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
    const db = getAdminDbOrThrow();
    const { id } = await params;

    const ref = db.collection("vehicles").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
