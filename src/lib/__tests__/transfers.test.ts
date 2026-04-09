import { describe, it, expect } from "vitest";
import { getTransferBySlug, getAllTransferSlugs, TRANSFER_ROUTES } from "@/content/transfers";

describe("TRANSFER_ROUTES config", () => {
  it("has unique slugs", () => {
    const slugs = TRANSFER_ROUTES.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every route has all 4 language contents", () => {
    for (const r of TRANSFER_ROUTES) {
      for (const lang of ["tr", "de", "en", "ru"] as const) {
        expect(r.content[lang], `${r.slug} missing ${lang}`).toBeDefined();
        expect(r.content[lang].h1.length, `${r.slug} ${lang} h1 empty`).toBeGreaterThan(0);
        expect(r.content[lang].metaTitle.length, `${r.slug} ${lang} metaTitle`).toBeGreaterThan(0);
        expect(r.content[lang].metaDescription.length, `${r.slug} ${lang} metaDesc`).toBeGreaterThan(0);
        expect(r.content[lang].faqs.length, `${r.slug} ${lang} faqs`).toBeGreaterThanOrEqual(2);
        expect(r.content[lang].whyUs.length, `${r.slug} ${lang} whyUs`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("every related slug references a valid route", () => {
    const allSlugs = new Set(TRANSFER_ROUTES.map((r) => r.slug));
    for (const r of TRANSFER_ROUTES) {
      for (const rel of r.related) {
        expect(allSlugs.has(rel), `${r.slug} references unknown related: ${rel}`).toBe(true);
      }
    }
  });

  it("every route has at least one distance entry", () => {
    for (const r of TRANSFER_ROUTES) {
      expect(r.distances.length, `${r.slug} has no distances`).toBeGreaterThan(0);
    }
  });
});

describe("getTransferBySlug", () => {
  it("finds known slug", () => {
    expect(getTransferBySlug("belek-transfer")?.slug).toBe("belek-transfer");
  });

  it("returns undefined for unknown slug", () => {
    expect(getTransferBySlug("mars-transfer")).toBeUndefined();
  });
});

describe("getAllTransferSlugs", () => {
  it("returns all slugs", () => {
    expect(getAllTransferSlugs().length).toBe(TRANSFER_ROUTES.length);
  });
});
