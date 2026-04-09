import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/reservations/[rid]/events — fetch audit events for a reservation */
export async function GET(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    await verifyAdminToken(req);
    const db = getAdminDbOrThrow();
    const { rid } = await params;

    const snap = await db
      .collection("reservation_events")
      .where("reservationId", "==", rid)
      .orderBy("timestamp", "asc")
      .get();

    const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ events });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
