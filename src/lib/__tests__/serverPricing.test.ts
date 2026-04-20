import { describe, it, expect, vi } from "vitest";

type MockRow = Record<string, unknown>;

function mockDb(config: {
  route_prices?: MockRow[];
  service_variants?: MockRow[];
}) {
  function chain(rows: MockRow[]) {
    let filtered = [...rows];
    const builder: Record<string, any> = {};

    builder.select = () => builder;
    builder.eq = (col: string, val: unknown) => {
      filtered = filtered.filter((r) => r[col] === val);
      return builder;
    };
    builder.maybeSingle = () => ({ data: filtered[0] ?? null, error: null });
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

vi.mock("@/lib/pricing", () => ({
  getPrice: () => null,
}));

vi.mock("@/lib/domain/places", () => ({
  keyToLabel: (key: string) => {
    const map: Record<string, string> = {
      ayt: "Antalya Airport (AYT)",
      belek: "Belek",
      tekirova: "Tekirova",
    };
    return map[key] ?? null;
  },
}));

const { getRoutePrice, computeQuotedPrice } = await import("@/lib/server/pricing");

describe("final pricing math", () => {
  it("AYT -> Tekirova vip-10 standard = 65", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "tekirova", vehicle_type: "vip-10", base_price_eur: 65, is_active: true },
      ],
    });

    const result = await computeQuotedPrice(db, "ayt", "tekirova", "vip-10", "standard");
    expect(result.quotedBasePrice).toBe(65);
    expect(result.variantSurcharge).toBe(0);
    expect(result.quotedTotalPrice).toBe(65);
  });

  it("AYT -> Tekirova vip-10 maybach = 75", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "tekirova", vehicle_type: "vip-10", base_price_eur: 65, is_active: true },
      ],
      service_variants: [
        { service_type_id: "vip-10", key: "maybach", price_modifier_eur: 10, is_active: true },
      ],
    });

    const result = await computeQuotedPrice(db, "ayt", "tekirova", "vip-10", "maybach");
    expect(result.quotedBasePrice).toBe(65);
    expect(result.variantSurcharge).toBe(10);
    expect(result.quotedTotalPrice).toBe(75);
  });

  it("AYT -> Tekirova vip-16 standard = 70", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "tekirova", vehicle_type: "vip-16", base_price_eur: 70, is_active: true },
      ],
    });

    const result = await computeQuotedPrice(db, "ayt", "tekirova", "vip-16", "standard");
    expect(result.quotedBasePrice).toBe(70);
    expect(result.variantSurcharge).toBe(0);
    expect(result.quotedTotalPrice).toBe(70);
  });

  it("AYT -> Tekirova vip-16 maybach = 80", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "tekirova", vehicle_type: "vip-16", base_price_eur: 70, is_active: true },
      ],
      service_variants: [
        { service_type_id: "vip-16", key: "maybach", price_modifier_eur: 10, is_active: true },
      ],
    });

    const result = await computeQuotedPrice(db, "ayt", "tekirova", "vip-16", "maybach");
    expect(result.quotedBasePrice).toBe(70);
    expect(result.variantSurcharge).toBe(10);
    expect(result.quotedTotalPrice).toBe(80);
  });

  it("AYT -> Belek vip-10 standard = 45", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "belek", vehicle_type: "vip-10", base_price_eur: 45, is_active: true },
      ],
    });

    const result = await computeQuotedPrice(db, "ayt", "belek", "vip-10", "standard");
    expect(result.quotedTotalPrice).toBe(45);
  });

  it("AYT -> Belek vip-16 standard = 50", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "belek", vehicle_type: "vip-16", base_price_eur: 50, is_active: true },
      ],
    });

    const result = await computeQuotedPrice(db, "ayt", "belek", "vip-16", "standard");
    expect(result.quotedTotalPrice).toBe(50);
  });

  it("supports reverse direction lookup", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "tekirova", vehicle_type: "vip-10", base_price_eur: 65, is_active: true },
      ],
    });

    const price = await getRoutePrice(db, "tekirova", "ayt", "vip-10");
    expect(price).toEqual({ basePriceEur: 65, source: "db" });
  });

  it("returns no quote for invalid route", async () => {
    const db = mockDb({ route_prices: [] });
    const result = await computeQuotedPrice(db, "mars", "jupiter", "vip-10", "standard");
    expect(result.quotedBasePrice).toBeNull();
    expect(result.quotedTotalPrice).toBeNull();
    expect(result.priceSource).toBeNull();
  });

  it("quote snapshot fields are complete", async () => {
    const db = mockDb({
      route_prices: [
        { from_key: "ayt", to_key: "tekirova", vehicle_type: "vip-10", base_price_eur: 65, is_active: true },
      ],
    });
    const result = await computeQuotedPrice(db, "ayt", "tekirova", "vip-10", "standard");
    expect(result).toMatchObject({
      quotedBasePrice: 65,
      variantSurcharge: 0,
      quotedTotalPrice: 65,
      currency: "EUR",
      priceSource: "db",
    });
  });
});
