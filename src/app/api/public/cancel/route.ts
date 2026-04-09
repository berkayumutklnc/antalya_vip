import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { PublicCancelSchema } from "@/lib/validation/publicLookup";
import { canRequestCancel } from "@/lib/domain/reservationStatus";
import { logCancelRequested } from "@/lib/server/reservationEvents";
import { notify } from "@/lib/server/notifications";
import { SITE } from "@/config/site";
import { publicCancelLimiter, getClientIp } from "@/lib/server/rateLimit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(req);
    if (!publicCancelLimiter.check(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = PublicCancelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { code: normCode, email: normMail, reason } = parsed.data;
    const adminDb = getAdminDbOrThrow();

    const ref = adminDb.collection("reservations").doc(normCode);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const d = snap.data()!;
    if (String(d.email || "").toLowerCase() !== normMail) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Domain guard
    const check = canRequestCancel({
      status: d.status,
      cancel: d.cancel,
      startAt: d.startAt,
    });
    if (!check.ok) {
      return NextResponse.json({ error: check.reason }, { status: 400 });
    }

    const now = Date.now();
    const trimmedReason = reason.trim() || null;

    await ref.update({
      cancel: {
        requested: true,
        reason: trimmedReason,
        requestedAt: now,
        canceledAt: null,
      },
      updatedAt: now,
    });

    // Audit event (non-blocking)
    logCancelRequested({
      db: adminDb,
      reservationId: normCode,
      reservationCode: d.code ?? normCode,
      actorType: "public",
      reason: trimmedReason,
    }).catch((e) => console.error("[audit] cancel_requested failed:", e));

    // Notification to admin (non-blocking)
    notify({
      db: adminDb,
      type: "cancel_requested_admin",
      data: {
        code: d.code ?? normCode,
        email: d.email ?? normMail,
        fullName: d.fullName ?? "-",
        from: d.from ?? "",
        to: d.to ?? "",
        date: d.date ?? "",
        time: d.time ?? "",
        phone: d.phone ?? "",
        cancelReason: trimmedReason,
      },
      triggeredBy: "public",
      recipientOverride: SITE.email,
    }).catch((e) => console.error("[notify] cancel_requested_admin failed:", e));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
