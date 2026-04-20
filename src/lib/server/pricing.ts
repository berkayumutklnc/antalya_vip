/**
 * Server-side pricing service — single source of truth.
 *
 * Reads from the `route_prices` table in Supabase.
 * Falls back to the legacy hardcoded matrix (src/lib/pricing.ts) during the
 * transition period until all route prices are confirmed seeded in DB.
 *
 * Phase 2 will add service_variants surcharge lookup here.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getPrice as getLegacyPrice } from "@/lib/pricing";
import { keyToLabel } from "@/lib/domain/places";
import type { VehicleType } from "@/types";

export interface RoutePriceResult {
  basePriceEur: number;
  source: "db" | "legacy";
}

/**
 * Look up route price from database.
 * Tries exact direction first, then reverse.
 * Falls back to legacy hardcoded matrix if no active DB row found.
 */
export async function getRoutePrice(
  db: SupabaseClient,
  fromKey: string,
  toKey: string,
  vehicleType: string,
): Promise<RoutePriceResult | null> {
  // Try exact direction in DB
  const { data } = await db
    .from("route_prices")
    .select("base_price_eur")
    .eq("from_key", fromKey)
    .eq("to_key", toKey)
    .eq("vehicle_type", vehicleType)
    .eq("is_active", true)
    .maybeSingle();

  if (data) {
    return { basePriceEur: Number(data.base_price_eur), source: "db" };
  }

  // Try reverse direction in DB
  const { data: reverse } = await db
    .from("route_prices")
    .select("base_price_eur")
    .eq("from_key", toKey)
    .eq("to_key", fromKey)
    .eq("vehicle_type", vehicleType)
    .eq("is_active", true)
    .maybeSingle();

  if (reverse) {
    return { basePriceEur: Number(reverse.base_price_eur), source: "db" };
  }

  // Legacy fallback — will be removed after full DB seed is verified
  const fromLabel = keyToLabel(fromKey);
  const toLabel = keyToLabel(toKey);
  if (fromLabel && toLabel) {
    const legacyPrice = getLegacyPrice(fromLabel, toLabel, vehicleType as VehicleType);
    if (legacyPrice !== null) {
      console.warn(
        `[pricing] legacy fallback used: ${fromKey}→${toKey} ${vehicleType} = ${legacyPrice}`,
      );
      return { basePriceEur: legacyPrice, source: "legacy" };
    }
  }

  return null;
}

/**
 * Compute the full quoted price for a reservation.
 * Returns snapshot fields ready for DB insertion.
 *
 * Includes variant surcharge from service_variants table.
 */
export async function computeQuotedPrice(
  db: SupabaseClient,
  fromKey: string,
  toKey: string,
  vehicleType: string,
  serviceVariantKey?: string | null,
): Promise<{
  quotedBasePrice: number | null;
  variantSurcharge: number;
  quotedTotalPrice: number | null;
  currency: string;
  priceSource: "db" | "legacy" | null;
}> {
  const result = await getRoutePrice(db, fromKey, toKey, vehicleType);

  if (!result) {
    return {
      quotedBasePrice: null,
      variantSurcharge: 0,
      quotedTotalPrice: null,
      currency: "EUR",
      priceSource: null,
    };
  }

  // Look up variant surcharge from service_variants table
  let variantSurcharge = 0;
  if (serviceVariantKey) {
    const { data: variant } = await db
      .from("service_variants")
      .select("price_modifier_eur")
      .eq("service_type_id", vehicleType)
      .eq("key", serviceVariantKey)
      .eq("is_active", true)
      .maybeSingle();

    if (variant) {
      variantSurcharge = Number(variant.price_modifier_eur);
    }
  }

  const total = result.basePriceEur + variantSurcharge;

  return {
    quotedBasePrice: result.basePriceEur,
    variantSurcharge,
    quotedTotalPrice: total,
    currency: "EUR",
    priceSource: result.source,
  };
}
