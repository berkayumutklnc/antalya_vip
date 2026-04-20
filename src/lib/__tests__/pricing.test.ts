import { describe, it, expect } from "vitest";
import { getPrice, pricingMatrix } from "@/lib/pricing";

describe("pricingMatrix", () => {
  it("has AYT as a from-key with all expected destinations", () => {
    const ayt = pricingMatrix["Antalya Airport (AYT)"];
    expect(ayt).toBeDefined();
    expect(Object.keys(ayt)).toEqual(
      expect.arrayContaining(["Belek", "Kemer", "Lara", "Side", "Alanya", "Kundu", "Antalya City Center"]),
    );
  });

  it("every price is a positive number", () => {
    for (const [from, destinations] of Object.entries(pricingMatrix)) {
      for (const [to, vehicles] of Object.entries(destinations)) {
        for (const [vType, price] of Object.entries(vehicles)) {
          expect(price, `${from} → ${to} [${vType}]`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("getPrice", () => {
  it("returns correct legacy fallback price for AYT → Belek vip-6", () => {
    expect(getPrice("Antalya Airport (AYT)", "Belek", "vip-6")).toBe(70);
  });

  it("returns correct price for AYT → Alanya vip-16", () => {
    expect(getPrice("Antalya Airport (AYT)", "Alanya", "vip-16")).toBe(250);
  });

  it("handles reverse lookup for legacy vip-6 routes (Belek → AYT)", () => {
    expect(getPrice("Belek", "Antalya Airport (AYT)", "vip-6")).toBe(70);
  });

  it("handles bidirectional fallback for routes only defined one way", () => {
    // Kundu → AYT not explicitly in matrix, but AYT → Kundu is
    expect(getPrice("Kundu", "Antalya Airport (AYT)", "vip-6")).toBe(45);
  });

  it("returns null for unknown route", () => {
    expect(getPrice("Mars", "Jupiter", "vip-6")).toBeNull();
  });

  it("returns null for unknown vehicle type on valid route", () => {
    // @ts-expect-error testing invalid type
    expect(getPrice("Antalya Airport (AYT)", "Belek", "bus-50")).toBeNull();
  });

  it("all AYT destinations have all 3 vehicle types priced", () => {
    const ayt = pricingMatrix["Antalya Airport (AYT)"];
    for (const [dest, prices] of Object.entries(ayt)) {
      for (const vt of ["vip-6", "vip-10", "vip-16"] as const) {
        expect(prices[vt], `AYT → ${dest} [${vt}]`).toBeDefined();
        expect(prices[vt], `AYT → ${dest} [${vt}]`).toBeGreaterThan(0);
      }
    }
  });
});
