import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
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
    const db = getAdminClient();

    const { data: d } = await db
      .from("reservations")
      .select("*")
      .eq("code", normCode)
      .maybeSingle();

    if (!d) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (String(d.email || "").toLowerCase() !== normMail) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const check = canRequestCancel({
      status: d.status,
      cancel: d.cancel_requested ? { requested: d.cancel_requested } : undefined,
      startAt: d.start_at,
    });
    if (!check.ok) {
      return NextResponse.json({ error: check.reason }, { status: 400 });
    }

    const now = Date.now();
    const trimmedReason = reason.trim() || null;

    await db
      .from("reservations")
      .update({
        cancel_requested: true,
        cancel_reason: trimmedReason,
        cancel_requested_at: now,
        updated_at: new Date().toISOString(),
      })
      .eq("code", normCode);

    logCancelRequested({
      db,
      reservationId: normCode,
      reservationCode: d.code ?? normCode,
      actorType: "public",
      reason: trimmedReason,
    }).catch((e) => console.error("[audit] cancel_requested failed:", e));

    notify({
      db,
      type: "cancel_requested_admin",
      data: {
        code: d.code ?? normCode,
        email: d.email ?? normMail,
        fullName: d.full_name ?? "-",
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
