import { describe, it, expect } from "vitest";
import { validateBookingEligibility } from "@/lib/server/bookingGuard";

/**
 * Tests for the public booking guard (src/lib/server/bookingGuard.ts).
 *
 * Validates service type + variant eligibility checks:
 *  - vip-6 rejection
 *  - inactive service type rejection
 *  - non-bookable service type rejection
 *  - missing service type rejection
 *  - invalid variant rejection
 *  - inactive variant rejection
 *  - happy path (active + bookable + valid variant)
 */

/* ------------------------------------------------------------------ */
/* Mock DB builder                                                     */
/* ------------------------------------------------------------------ */

type MockRow = Record<string, unknown>;

function mockDb(config: {
  service_types?: MockRow[];
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
    builder.maybeSingle = () => {
      return { data: filtered[0] ?? null, error: null };
    };
    return builder;
  }

  return {
    from: (table: string) => {
      if (table === "service_types") return chain(config.service_types ?? []);
      if (table === "service_variants") return chain(config.service_variants ?? []);
      return chain([]);
    },
  } as any;
}

/* ================================================================== */
/* Tests                                                               */
/* ================================================================== */

describe("validateBookingEligibility", () => {
  // ── vip-6 blocked ──

  it("rejects vip-6 via serviceTypeId", async () => {
    const db = mockDb({});
    const result = await validateBookingEligibility(db, "vip-6", null, null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toContain("vip-6");
    }
  });

  it("rejects vip-6 via vehicleType fallback", async () => {
    const db = mockDb({});
    const result = await validateBookingEligibility(db, undefined, "vip-6", null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toContain("vip-6");
    }
  });

  // ── missing service type ──

  it("rejects when neither serviceTypeId nor vehicleType provided", async () => {
    const db = mockDb({});
    const result = await validateBookingEligibility(db, undefined, undefined, null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toContain("required");
    }
  });

  // ── non-existent service type ──

  it("rejects unknown service type", async () => {
    const db = mockDb({ service_types: [] });
    const result = await validateBookingEligibility(db, "vip-99", null, null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toContain("does not exist");
    }
  });

  // ── inactive service type ──

  it("rejects inactive service type", async () => {
    const db = mockDb({
      service_types: [{ id: "vip-10", is_active: false, is_bookable: true }],
    });
    const result = await validateBookingEligibility(db, "vip-10", null, null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(409);
      expect(result.error).toContain("inactive");
    }
  });

  // ── non-bookable service type ──

  it("rejects non-bookable service type", async () => {
    const db = mockDb({
      service_types: [{ id: "vip-10", is_active: true, is_bookable: false }],
    });
    const result = await validateBookingEligibility(db, "vip-10", null, null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(409);
      expect(result.error).toContain("not available for booking");
    }
  });

  // ── invalid variant ──

  it("rejects non-existent variant", async () => {
    const db = mockDb({
      service_types: [{ id: "vip-10", is_active: true, is_bookable: true }],
      service_variants: [],
    });
    const result = await validateBookingEligibility(db, "vip-10", null, "ghost-variant");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toContain("ghost-variant");
      expect(result.error).toContain("does not exist");
    }
  });

  // ── inactive variant ──

  it("rejects inactive variant", async () => {
    const db = mockDb({
      service_types: [{ id: "vip-10", is_active: true, is_bookable: true }],
      service_variants: [
        { id: "v-1", service_type_id: "vip-10", key: "maybach", is_active: false },
      ],
    });
    const result = await validateBookingEligibility(db, "vip-10", null, "maybach");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(409);
      expect(result.error).toContain("inactive");
    }
  });

  // ── happy paths ──

  it("allows active+bookable service type without variant", async () => {
    const db = mockDb({
      service_types: [{ id: "vip-10", is_active: true, is_bookable: true }],
    });
    const result = await validateBookingEligibility(db, "vip-10", null, null);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.serviceTypeId).toBe("vip-10");
      expect(result.serviceVariantKey).toBeNull();
    }
  });

  it("allows active+bookable type with active variant", async () => {
    const db = mockDb({
      service_types: [{ id: "vip-10", is_active: true, is_bookable: true }],
      service_variants: [
        { id: "v-1", service_type_id: "vip-10", key: "maybach", is_active: true },
      ],
    });
    const result = await validateBookingEligibility(db, "vip-10", null, "maybach");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.serviceTypeId).toBe("vip-10");
      expect(result.serviceVariantKey).toBe("maybach");
    }
  });

  it("resolves serviceTypeId from vehicleType when serviceTypeId absent", async () => {
    const db = mockDb({
      service_types: [{ id: "vip-16", is_active: true, is_bookable: true }],
    });
    const result = await validateBookingEligibility(db, undefined, "vip-16", null);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.serviceTypeId).toBe("vip-16");
    }
  });

  it("prefers serviceTypeId over vehicleType", async () => {
    const db = mockDb({
      service_types: [{ id: "vip-16", is_active: true, is_bookable: true }],
    });
    // serviceTypeId is authoritative — vehicleType is ignored
    const result = await validateBookingEligibility(db, "vip-16", "vip-10", null);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.serviceTypeId).toBe("vip-16");
    }
  });
});
