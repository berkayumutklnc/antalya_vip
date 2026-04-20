import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;

type MockDbConfig = {
  route_prices?: Row[];
  service_types?: Row[];
  service_variants?: Row[];
};

function createMockDb(config: MockDbConfig, inserts: Row[]) {
  function chain(rows: Row[]) {
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
      if (table === "service_types") return chain(config.service_types ?? []);
      if (table === "service_variants") return chain(config.service_variants ?? []);
      if (table === "reservations") {
        return {
          insert: async (payload: Row) => {
            inserts.push(payload);
            return { error: null };
          },
        };
      }
      return chain([]);
    },
  } as any;
}

const mockGetAdminClient = vi.fn();

vi.mock("@/lib/supabaseAdmin", () => ({
  getAdminClient: () => mockGetAdminClient(),
}));

vi.mock("@/lib/server/pnr", () => ({
  generateUniquePNR: async () => "ZT-TEST01",
}));

vi.mock("@/utils/time", () => ({
  istToUtcMs: () => 1_710_000_000_000,
}));

vi.mock("@/lib/server/rateLimit", () => ({
  reservationCreateLimiter: { check: () => true },
  getClientIp: () => "127.0.0.1",
}));

vi.mock("@/lib/server/reservationEvents", () => ({
  logCreated: () => Promise.resolve(),
}));

vi.mock("@/lib/server/notifications", () => ({
  notify: () => Promise.resolve(),
  notifyTelegram: () => Promise.resolve(),
}));

const { POST } = await import("./route");

describe("POST /api/public/reservations", () => {
  const baseBody = {
    from: "Antalya Airport (AYT)",
    to: "Tekirova",
    date: "2026-06-01",
    time: "10:00",
    fullName: "Test User",
    phone: "+905001112233",
    email: "test@example.com",
    lang: "en",
    adults: 2,
    babySeat: 1,
    serviceTypeId: "vip-10",
    serviceVariantKey: "maybach",
    acceptPolicy: true,
    acceptKvkk: true,
    acceptComms: false,
  };

  beforeEach(() => {
    mockGetAdminClient.mockReset();
  });

  it("stores quoted snapshot fields from computed totals", async () => {
    const inserts: Row[] = [];
    mockGetAdminClient.mockReturnValue(
      createMockDb(
        {
          route_prices: [
            { from_key: "ayt", to_key: "tekirova", vehicle_type: "vip-10", base_price_eur: 65, is_active: true },
          ],
          service_types: [{ id: "vip-10", is_active: true, is_bookable: true }],
          service_variants: [
            { service_type_id: "vip-10", key: "maybach", price_modifier_eur: 10, is_active: true },
          ],
        },
        inserts,
      ),
    );

    const req = new Request("https://example.com/api/public/reservations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(inserts.length).toBe(1);

    const row = inserts[0];
    expect(row.quoted_base_price).toBe(65);
    expect(row.variant_surcharge).toBe(10);
    expect(row.quoted_total_price).toBe(75);
    expect(row.price).toBe(75);
    expect(row.service_type_id).toBe("vip-10");
    expect(row.service_variant_key).toBe("maybach");
  });

  it("does not insert reservation when quote cannot be resolved", async () => {
    const inserts: Row[] = [];
    mockGetAdminClient.mockReturnValue(
      createMockDb(
        {
          route_prices: [],
          service_types: [
            { id: "vip-10", is_active: true, is_bookable: true },
            { id: "vip-16", is_active: true, is_bookable: true },
          ],
          service_variants: [
            { service_type_id: "vip-10", key: "standard", price_modifier_eur: 0, is_active: true },
            { service_type_id: "vip-16", key: "standard", price_modifier_eur: 0, is_active: true },
          ],
        },
        inserts,
      ),
    );

    const req = new Request("https://example.com/api/public/reservations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...baseBody, serviceTypeId: "vip-16", serviceVariantKey: "standard" }),
    });

    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toContain("Price could not be determined");
    expect(inserts.length).toBe(0);
  });

  it("blocks non-bookable service types", async () => {
    const inserts: Row[] = [];
    mockGetAdminClient.mockReturnValue(
      createMockDb(
        {
          service_types: [{ id: "vip-10", is_active: true, is_bookable: false }],
          service_variants: [
            { service_type_id: "vip-10", key: "standard", price_modifier_eur: 0, is_active: true },
          ],
        },
        inserts,
      ),
    );

    const req = new Request("https://example.com/api/public/reservations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...baseBody, serviceVariantKey: "standard" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    expect(inserts.length).toBe(0);
  });

  it("blocks invalid variant/type combinations", async () => {
    const inserts: Row[] = [];
    mockGetAdminClient.mockReturnValue(
      createMockDb(
        {
          service_types: [{ id: "vip-16", is_active: true, is_bookable: true }],
          service_variants: [
            { service_type_id: "vip-16", key: "standard", price_modifier_eur: 0, is_active: true },
          ],
          route_prices: [
            { from_key: "ayt", to_key: "tekirova", vehicle_type: "vip-16", base_price_eur: 70, is_active: true },
          ],
        },
        inserts,
      ),
    );

    const req = new Request("https://example.com/api/public/reservations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...baseBody, serviceTypeId: "vip-16", serviceVariantKey: "ghost" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(inserts.length).toBe(0);
  });
});
