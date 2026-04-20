import { describe, expect, it } from "vitest";
import {
  getPublicBookableServiceTypes,
  isPublicBookableServiceType,
} from "@/lib/public/serviceCatalog";

describe("serviceCatalog public filtering", () => {
  it("excludes vip-6 even if active+bookable", () => {
    expect(
      isPublicBookableServiceType({
        id: "vip-6",
        isActive: true,
        isBookable: true,
      }),
    ).toBe(false);
  });

  it("excludes inactive and non-bookable service types", () => {
    expect(
      isPublicBookableServiceType({
        id: "vip-10",
        isActive: false,
        isBookable: true,
      }),
    ).toBe(false);

    expect(
      isPublicBookableServiceType({
        id: "vip-16",
        isActive: true,
        isBookable: false,
      }),
    ).toBe(false);
  });

  it("returns only public commercial options", () => {
    const filtered = getPublicBookableServiceTypes([
      { id: "vip-6", isActive: true, isBookable: true },
      { id: "vip-10", isActive: true, isBookable: true },
      { id: "vip-16", isActive: true, isBookable: true },
      { id: "vip-99", isActive: false, isBookable: true },
    ]);

    expect(filtered.map((x) => x.id)).toEqual(["vip-10", "vip-16"]);
  });
});
