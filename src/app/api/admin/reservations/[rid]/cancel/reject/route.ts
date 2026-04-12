import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { canRejectCancel } from "@/lib/domain/reservationStatus";
import { logCancelRejected } from "@/lib/server/reservationEvents";
import { notify } from "@/lib/server/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    const adminUid = await verifyAdminToken(req);
    const db = getAdminClient();
    const { rid } = await params;

    const { data: r } = await db.from("reservations").select("*").eq("code", rid).maybeSingle();
    if (!r) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });

    const guard = canRejectCancel({
      status: r.status,
      cancel: r.cancel_requested ? { requested: r.cancel_requested } : undefined,
    });
    if (!guard.ok) {
      return NextResponse.json({ error: guard.reason }, { status: 400 });
    }

    await db.from("reservations").update({
      cancel_requested: false,
      updated_at: new Date().toISOString(),
    }).eq("code", rid);

    logCancelRejected({
      db,
      reservationId: rid,
      reservationCode: String(r.code ?? rid),
      actorType: "admin",
      actorId: adminUid,
    }).catch((e) => console.error("[audit] cancel_rejected failed:", e));

    notify({
      db,
      type: "cancel_rejected_customer",
      data: {
        code: String(r.code ?? rid),
        email: r.email ?? "",
        fullName: r.full_name ?? "-",
        from: r.from ?? "",
        to: r.to ?? "",
        date: r.date ?? "",
        time: r.time ?? "",
        phone: r.phone ?? "",
      },
      triggeredBy: "admin",
      triggeredById: adminUid,
    }).catch((e) => console.error("[notify] cancel_rejected_customer failed:", e));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[admin reject cancel]", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
