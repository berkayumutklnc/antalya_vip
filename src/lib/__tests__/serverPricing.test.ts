import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the DB-backed pricing service (src/lib/server/pricing.ts).
 *
 * These use mocked Supabase clients to test the logic without a live DB:
 *  - Route price lookup (exact + reverse + legacy fallback)
 *  - Variant surcharge computation
 *  - Inactive service type exclusion
 *  - Reservation quote snapshot shape
 *
 * Note: vip-6 assertions here are legacy compatibility checks, not
 * public/commercial offer expectations.
 */

/* ------------------------------------------------------------------ */
/* Mock builder: creates a chainable Supabase .from().select()... stub */
/* ------------------------------------------------------------------ */

type MockRow = Record<string, unknown>;

function mockDb(config: {
  route_prices?: MockRow[];
  service_variants?: MockRow[];
}) {
  // Build a query chain for a given table
  function chain(rows: MockRow[]) {
    let filtered = [...rows];
    const builder: Record<string, any> = {};

    builder.select = () => builder;
    builder.eq = (col: string, val: unknown) => {
      filtered = filtered.filter((r) => r[col] === val);
      return builder;
    };
    builder.maybeSingle = () => {
      return { data: filtered[0] ?? null, error: null };
    };
    return builder;
  }

  return {
    from: (table: string) => {
      if (table === "route_prices") return chain(config.route_prices ?? []);
      if (table === "service_variants") return chain(config.service_variants ?? []);
      return chain([]);
    },
  } as any;
}

/* ------------------------------------------------------------------ */
/* Mocks for legacy pricing — never hit real module during tests      */
/* ------------------------------------------------------------------ */

vi.mock("@/lib/pricing", () => ({
  getPrice: (from: string, to: string, vt: string) => {
    // Return a known legacy price for one specific route
    if (from === "Antalya Airport (AYT)" && to === "Belek" && vt === "vip-6") return 70;
    if (from === "Belek" && to === "Antalya Airport (AYT)" && vt === "vip-6") return 70;
    return null;
  },
}));

vi.mock("@/lib/domain/places", () => ({
  keyToLabel: (key: string) => {
    const map: Record<string, string> = {
      ayt: "Antalya Airport (AYT)",
      belek: "Belek",
    };
    return map[key] ?? null;
  },
}));

/* ------------------------------------------------------------------ */
/* Import AFTER mocks are set up                                       */
/* ------------------------------------------------------------------ */

const { getRoutePrice, computeQuotedPrice } = await import("@/lib/server/pricing");

/* ================================================================== */
/* Tests                                                               */
/* ================================================================== */

describe("getRoutePrice", () => {
  it("returns DB price for exact direction match", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "belek", vehicle_type: "vip-6", base_price_eur: 75, is_active: true },
      ],
    });
    const result = await getRoutePrice(db, "ayt", "belek", "vip-6");
    expect(result).toEqual({ basePriceEur: 75, source: "db" });
  });

  it("returns DB price for reverse direction", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "belek", to_key: "ayt", vehicle_type: "vip-6", base_price_eur: 75, is_active: true },
      ],
    });
    const result = await getRoutePrice(db, "ayt", "belek", "vip-6");
    expect(result).toEqual({ basePriceEur: 75, source: "db" });
  });

  it("ignores inactive DB rows and falls back to legacy", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "belek", vehicle_type: "vip-6", base_price_eur: 75, is_active: false },
      ],
    });
    const result = await getRoutePrice(db, "ayt", "belek", "vip-6");
    // Falls back to legacy mock which returns 70
    expect(result).toEqual({ basePriceEur: 70, source: "legacy" });
  });

  it("returns null for completely unknown route", async () => {
    const db = mockDb({ route_prices: [] });
    const result = await getRoutePrice(db, "mars", "jupiter", "vip-6");
    expect(result).toBeNull();
  });

  it("differentiates vehicle types", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "belek", vehicle_type: "vip-6", base_price_eur: 75, is_active: true },
        { from_key: "ayt", to_key: "belek", vehicle_type: "vip-10", base_price_eur: 120, is_active: true },
      ],
    });
    const r6 = await getRoutePrice(db, "ayt", "belek", "vip-6");
    const r10 = await getRoutePrice(db, "ayt", "belek", "vip-10");
    expect(r6!.basePriceEur).toBe(75);
    expect(r10!.basePriceEur).toBe(120);
  });
});

describe("computeQuotedPrice", () => {
  it("returns full quote without variant", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "belek", vehicle_type: "vip-10", base_price_eur: 120, is_active: true },
      ],
    });
    const result = await computeQuotedPrice(db, "ayt", "belek", "vip-10");
    expect(result).toEqual({
      quotedBasePrice: 120,
      variantSurcharge: 0,
      quotedTotalPrice: 120,
      currency: "EUR",
      priceSource: "db",
    });
  });

  it("adds variant surcharge (maybach)", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "belek", vehicle_type: "vip-10", base_price_eur: 120, is_active: true },
      ],
      service_variants: [
        { service_type_id: "vip-10", key: "maybach", price_modifier_eur: 50, is_active: true },
      ],
    });
    const result = await computeQuotedPrice(db, "ayt", "belek", "vip-10", "maybach");
    expect(result.quotedBasePrice).toBe(120);
    expect(result.variantSurcharge).toBe(50);
    expect(result.quotedTotalPrice).toBe(170);
  });

  it("ignores inactive variant", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "belek", vehicle_type: "vip-10", base_price_eur: 120, is_active: true },
      ],
      service_variants: [
        { service_type_id: "vip-10", key: "maybach", price_modifier_eur: 50, is_active: false },
      ],
    });
    const result = await computeQuotedPrice(db, "ayt", "belek", "vip-10", "maybach");
    expect(result.variantSurcharge).toBe(0);
    expect(result.quotedTotalPrice).toBe(120);
  });

  it("returns null prices when route not found", async () => {
    const db = mockDb({ route_prices: [] });
    const result = await computeQuotedPrice(db, "mars", "jupiter", "vip-6");
    expect(result.quotedBasePrice).toBeNull();
    expect(result.quotedTotalPrice).toBeNull();
    expect(result.priceSource).toBeNull();
  });

  it("quote snapshot has all expected fields", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "belek", vehicle_type: "vip-6", base_price_eur: 75, is_active: true },
      ],
    });
    const result = await computeQuotedPrice(db, "ayt", "belek", "vip-6");
    expect(result).toHaveProperty("quotedBasePrice");
    expect(result).toHaveProperty("variantSurcharge");
    expect(result).toHaveProperty("quotedTotalPrice");
    expect(result).toHaveProperty("currency");
    expect(result).toHaveProperty("priceSource");
  });
});
