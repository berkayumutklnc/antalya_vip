import { describe, it, expect, vi, beforeEach } from "vitest";

type Row = Record<string, unknown>;

function buildMockDb(config: {
  route_prices?: Row[];
  service_types?: Row[];
  service_variants?: Row[];
}) {
  function chain(rows: Row[]) {
    let filtered = [...rows];
    const builder: Record<string, any> = {};

    builder.select = () => builder;
    builder.eq = (col: string, val: unknown) => {
      filtered = filtered.filter((r) => r[col] === val);
      return builder;
    };
    builder.neq = (col: string, val: unknown) => {
      filtered = filtered.filter((r) => r[col] !== val);
      return builder;
    };
    builder.in = (col: string, vals: unknown[]) => {
      filtered = filtered.filter((r) => vals.includes(r[col]));
      return builder;
    };
    builder.order = () => builder;
    builder.maybeSingle = () => ({ data: filtered[0] ?? null, error: null });
    return builder;
  }

  return {
    from: (table: string) => {
      if (table === "route_prices") return chain(config.route_prices ?? []);
      if (table === "service_types") return chain(config.service_types ?? []);
      if (table === "service_variants") return chain(config.service_variants ?? []);
      return chain([]);
    },
  } as any;
}

const mockGetAdminClient = vi.fn();

vi.mock("@/lib/supabaseAdmin", () => ({
  getAdminClient: () => mockGetAdminClient(),
}));

vi.mock("@/lib/server/rateLimit", () => ({
  availabilityLimiter: { check: () => true },
  getClientIp: () => "127.0.0.1",
}));

const { GET } = await import("./route");

describe("GET /api/public/route-price", () => {
  beforeEach(() => {
    mockGetAdminClient.mockReset();
    mockGetAdminClient.mockReturnValue(
      buildMockDb({
        route_prices: [
          { from_key: "ayt", to_key: "tekirova", vehicle_type: "vip-10", base_price_eur: 65, is_active: true },
          { from_key: "ayt", to_key: "tekirova", vehicle_type: "vip-16", base_price_eur: 70, is_active: true },
          { from_key: "ayt", to_key: "belek", vehicle_type: "vip-10", base_price_eur: 45, is_active: true },
          { from_key: "ayt", to_key: "belek", vehicle_type: "vip-16", base_price_eur: 50, is_active: true },
        ],
        service_types: [
          { id: "vip-10", is_active: true, is_bookable: true },
          { id: "vip-16", is_active: true, is_bookable: true },
          { id: "vip-6", is_active: true, is_bookable: false },
        ],
        service_variants: [
          { service_type_id: "vip-10", key: "standard", price_modifier_eur: 0, is_active: true },
          { service_type_id: "vip-10", key: "maybach", price_modifier_eur: 10, is_active: true },
          { service_type_id: "vip-16", key: "standard", price_modifier_eur: 0, is_active: true },
          { service_type_id: "vip-16", key: "maybach", price_modifier_eur: 10, is_active: true },
        ],
      }),
    );
  });

  async function call(fromKey: string, toKey: string, vehicleType: string, variantKey?: string) {
    const url = new URL("https://example.com/api/public/route-price");
    url.searchParams.set("from_key", fromKey);
    url.searchParams.set("to_key", toKey);
    url.searchParams.set("vehicle_type", vehicleType);
    if (variantKey) url.searchParams.set("variant_key", variantKey);
    const res = await GET(new Request(url.toString()));
    const body = await res.json();
    return { status: res.status, body };
  }

  it("returns AYT -> Tekirova vip-10 standard = 65", async () => {
    const { status, body } = await call("ayt", "tekirova", "vip-10", "standard");
    expect(status).toBe(200);
    expect(body.basePriceEur).toBe(65);
    expect(body.totalPriceEur).toBe(65);
  });

  it("returns AYT -> Tekirova vip-10 maybach = 75", async () => {
    const { status, body } = await call("ayt", "tekirova", "vip-10", "maybach");
    expect(status).toBe(200);
    expect(body.basePriceEur).toBe(65);
    expect(body.variantSurcharge).toBe(10);
    expect(body.totalPriceEur).toBe(75);
  });

  it("returns AYT -> Tekirova vip-16 standard = 70", async () => {
    const { status, body } = await call("ayt", "tekirova", "vip-16", "standard");
    expect(status).toBe(200);
    expect(body.basePriceEur).toBe(70);
    expect(body.totalPriceEur).toBe(70);
  });

  it("returns AYT -> Tekirova vip-16 maybach = 80", async () => {
    const { status, body } = await call("ayt", "tekirova", "vip-16", "maybach");
    expect(status).toBe(200);
    expect(body.basePriceEur).toBe(70);
    expect(body.variantSurcharge).toBe(10);
    expect(body.totalPriceEur).toBe(80);
  });

  it("returns AYT -> Belek vip-10 standard = 45", async () => {
    const { status, body } = await call("ayt", "belek", "vip-10", "standard");
    expect(status).toBe(200);
    expect(body.totalPriceEur).toBe(45);
  });

  it("returns AYT -> Belek vip-16 standard = 50", async () => {
    const { status, body } = await call("ayt", "belek", "vip-16", "standard");
    expect(status).toBe(200);
    expect(body.totalPriceEur).toBe(50);
  });

  it("supports reverse direction lookup", async () => {
    const { status, body } = await call("tekirova", "ayt", "vip-10", "standard");
    expect(status).toBe(200);
    expect(body.totalPriceEur).toBe(65);
  });

  it("returns no quote for invalid route", async () => {
    const { status, body } = await call("ayt", "mars", "vip-10", "standard");
    expect(status).toBe(404);
    expect(body.error).toContain("No price found");
  });
});
