import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/admin/vehicles/[id]/slots — add a blocked slot */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminToken(req);
    const db = getAdminDbOrThrow();
    const { id } = await params;
    const body = await req.json();

    const startAt = Number(body.startAt);
    const endAt = Number(body.endAt);
    const reason = typeof body.reason === "string" ? body.reason.trim() : "manual";

    if (!startAt || !endAt || endAt <= startAt) {
      return NextResponse.json({ error: "Invalid startAt/endAt" }, { status: 400 });
    }

    const ref = db.collection("vehicles").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data()!;
    const slots: any[] = Array.isArray(data.blockedSlots) ? data.blockedSlots : [];

    // Check for overlap
    const clash = slots.some(
      (s: any) => Number(s.startAt) < endAt && startAt < Number(s.endAt),
    );
    if (clash) {
      return NextResponse.json({ error: "Overlaps with existing slot" }, { status: 409 });
    }

    const newSlot = { startAt, endAt, reason, updatedAt: Date.now() };
    await ref.update({
      blockedSlots: [...slots, newSlot],
      updatedAt: Date.now(),
    });

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
    const db = getAdminDbOrThrow();
    const { id } = await params;

    const url = new URL(req.url);
    const idx = Number(url.searchParams.get("index"));
    if (isNaN(idx) || idx < 0) {
      return NextResponse.json({ error: "index query param required" }, { status: 400 });
    }

    const ref = db.collection("vehicles").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data()!;
    const slots: any[] = Array.isArray(data.blockedSlots) ? [...data.blockedSlots] : [];
    if (idx >= slots.length) {
      return NextResponse.json({ error: "Index out of range" }, { status: 400 });
    }

    slots.splice(idx, 1);
    await ref.update({ blockedSlots: slots, updatedAt: Date.now() });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
