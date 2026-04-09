import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { getNotificationLogs } from "@/lib/server/notificationLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reservations/[rid]/notifications
 *
 * Returns notification logs for a reservation (newest first).
 */
export async function GET(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  try {
    await verifyAdminToken(req);
    const adminDb = getAdminDbOrThrow();
    const { rid } = await params;

    const logs = await getNotificationLogs(adminDb, rid, 100);

    return NextResponse.json({ logs });
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: (e as AuthError).message }, { status: (e as AuthError).status });
    }
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin notification logs]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
