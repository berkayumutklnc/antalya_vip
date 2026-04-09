import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await verifyAdminToken(req);
    const adminDb = getAdminDbOrThrow();

    const snap = await adminDb
      .collection("reservations")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const items = snap.docs.map((d) => ({ rid: d.id, ...d.data() }));
    return NextResponse.json({ items });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}
