import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { labelToKey } from "@/lib/domain/places";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/tools/backfill-place-keys
 *
 * Scans all reservations and adds `fromKey`/`toKey` fields where missing.
 * Safe to run multiple times — only patches documents without keys.
 */
export async function POST(req: Request) {
  try {
    await verifyAdminToken(req);
    const db = getAdminDbOrThrow();

    const snap = await db.collection("reservations").get();
    let patched = 0;
    let skipped = 0;
    const failed = 0;

    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH = 400; // Firestore limit is 500, keep some margin

    for (const doc of snap.docs) {
      const data = doc.data();
      // Skip if already has keys
      if (data.fromKey && data.toKey) {
        skipped++;
        continue;
      }

      const fromKey = labelToKey(data.from || "");
      const toKey = labelToKey(data.to || "");

      if (!fromKey && !toKey) {
        skipped++;
        continue;
      }

      const patch: Record<string, unknown> = {};
      if (fromKey && !data.fromKey) patch.fromKey = fromKey;
      if (toKey && !data.toKey) patch.toKey = toKey;

      if (Object.keys(patch).length === 0) {
        skipped++;
        continue;
      }

      batch.update(doc.ref, patch);
      batchCount++;
      patched++;

      if (batchCount >= MAX_BATCH) {
        await batch.commit();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({ ok: true, patched, skipped, failed, total: snap.size });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
