#!/usr/bin/env node
/**
 * Safe backfill for legacy reservations missing Phase 2+ pricing/catalog fields.
 *
 * Fills: service_type_id, service_variant_key, quoted_base_price,
 *        variant_surcharge, quoted_total_price, currency
 *
 * Safety rules:
 *  - Never overwrites a field that already has a non-null value.
 *  - Skips rows where vehicle_type is null (ambiguous).
 *  - Logs every decision for auditability.
 *  - Dry-run by default — pass --commit to apply changes.
 *
 * Usage:
 *   node scripts/backfill-reservations.mjs           # dry run
 *   node scripts/backfill-reservations.mjs --commit   # apply changes
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const commit = process.argv.includes("--commit");
const db = createClient(url, key, { auth: { persistSession: false } });

const stats = { scanned: 0, updated: 0, skipped: 0, errors: 0 };

async function run() {
  console.log(`[backfill] mode: ${commit ? "COMMIT" : "DRY RUN"}\n`);

  // Fetch all reservations (paginated 500 at a time)
  let from = 0;
  const pageSize = 500;

  while (true) {
    const { data: rows, error } = await db
      .from("reservations")
      .select("code, vehicle_type, service_type_id, service_variant_key, price, quoted_base_price, variant_surcharge, quoted_total_price, currency")
      .order("created_at", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("[backfill] query error:", error.message);
      process.exit(1);
    }
    if (!rows || rows.length === 0) break;

    for (const row of rows) {
      stats.scanned++;
      await backfillRow(row);
    }

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  console.log(`\n[backfill] done — scanned: ${stats.scanned}, updated: ${stats.updated}, skipped: ${stats.skipped}, errors: ${stats.errors}`);
  if (!commit && stats.updated > 0) {
    console.log("[backfill] Run with --commit to apply these changes.");
  }
}

async function backfillRow(row) {
  const updates = {};

  // Skip if vehicle_type is null — can't infer anything
  if (!row.vehicle_type) {
    console.log(`  SKIP ${row.code} — no vehicle_type`);
    stats.skipped++;
    return;
  }

  // 1. service_type_id: copy from vehicle_type if missing
  if (!row.service_type_id) {
    updates.service_type_id = row.vehicle_type;
  }

  // 2. service_variant_key: default to "standard" if missing
  if (!row.service_variant_key) {
    updates.service_variant_key = "standard";
  }

  // 3. Pricing snapshot fields — backfill from price if available
  if (row.quoted_base_price == null && row.price != null) {
    updates.quoted_base_price = Number(row.price);
  }

  if (row.variant_surcharge == null) {
    updates.variant_surcharge = 0;
  }

  if (row.quoted_total_price == null && row.price != null) {
    updates.quoted_total_price = Number(row.price);
  }

  if (!row.currency) {
    updates.currency = "EUR";
  }

  // Nothing to do?
  if (Object.keys(updates).length === 0) {
    return;
  }

  console.log(`  ${commit ? "UPDATE" : "WOULD UPDATE"} ${row.code}:`, JSON.stringify(updates));

  if (commit) {
    const { error } = await db
      .from("reservations")
      .update(updates)
      .eq("code", row.code);

    if (error) {
      console.error(`  ERROR ${row.code}:`, error.message);
      stats.errors++;
      return;
    }
  }

  stats.updated++;
}

run().catch((e) => {
  console.error("[backfill] fatal:", e);
  process.exit(1);
});
