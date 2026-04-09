import { describe, it, expect } from "vitest";
import {
  placeById,
  placeByLabel,
  labelToKey,
  keyToLabel,
  resolveKey,
  normalizePlaceFields,
} from "@/lib/domain/places";
import { PLACES, PLACE_LABELS } from "@/config/places";

describe("PLACES config", () => {
  it("has unique ids", () => {
    const ids = PLACES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique labels", () => {
    const labels = PLACES.map((p) => p.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("exports correct PLACE_LABELS count", () => {
    expect(PLACE_LABELS.length).toBe(PLACES.length);
  });
});

describe("placeById", () => {
  it("resolves known id", () => {
    expect(placeById("ayt")?.label).toBe("Antalya Airport (AYT)");
  });

  it("returns undefined for unknown id", () => {
    expect(placeById("mars")).toBeUndefined();
  });
});

describe("placeByLabel", () => {
  it("resolves known label", () => {
    expect(placeByLabel("Belek")?.id).toBe("belek");
  });

  it("returns undefined for unknown label", () => {
    expect(placeByLabel("Narnia")).toBeUndefined();
  });
});

describe("labelToKey / keyToLabel", () => {
  it("round-trips for every place", () => {
    for (const p of PLACES) {
      expect(labelToKey(p.label)).toBe(p.id);
      expect(keyToLabel(p.id)).toBe(p.label);
    }
  });
});

describe("resolveKey", () => {
  it("resolves from id directly", () => {
    expect(resolveKey("kemer")).toBe("kemer");
  });

  it("resolves from label", () => {
    expect(resolveKey("Kemer")).toBe("kemer");
  });

  it("returns undefined for unknown input", () => {
    expect(resolveKey("unknown")).toBeUndefined();
  });
});

describe("normalizePlaceFields", () => {
  it("returns keys and labels for valid labels", () => {
    const result = normalizePlaceFields("Antalya Airport (AYT)", "Belek");
    expect(result).toEqual({
      fromKey: "ayt",
      toKey: "belek",
      fromLabel: "Antalya Airport (AYT)",
      toLabel: "Belek",
    });
  });

  it("returns null keys for unknown labels", () => {
    const result = normalizePlaceFields("Unknown Place", "Belek");
    expect(result.fromKey).toBeNull();
    expect(result.toKey).toBe("belek");
  });
});
