import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";

const adminDb = getAdminDbOrThrow();
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { code, email, reason } = await req.json();

    if (!code || !email) {
      return NextResponse.json({ error: "Missing code or email" }, { status: 400 });
    }

    const normCode = String(code).trim().toUpperCase();
    const normMail = String(email).trim().toLowerCase();

    const ref = adminDb.collection("reservations").doc(normCode);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const d = snap.data() as any;
    if (String(d.email || "").toLowerCase() !== normMail) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (d.status === "canceled") {
      return NextResponse.json({ error: "already_canceled" }, { status: 400 });
    }
    if (d.cancel?.requested) {
      return NextResponse.json({ error: "already_requested" }, { status: 400 });
    }

    const startAt = Number(d.startAt) || 0;
    if (startAt > 0 && startAt - Date.now() < 12 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "too_late" }, { status: 400 });
    }

    await ref.update({
      cancel: {
        requested: true,
        reason: (String(reason || "").trim()) || null,
        requestedAt: Date.now(),
        canceledAt: null,
      },
      updatedAt: Date.now(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
