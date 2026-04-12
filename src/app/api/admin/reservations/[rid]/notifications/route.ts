import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { getNotificationLogs } from "@/lib/server/notificationLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/reservations/[rid]/notifications — fetch notification logs */
export async function GET(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();
    const { rid } = await params;

    const logs = await getNotificationLogs(db, rid, 100);

    return NextResponse.json({ logs });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
