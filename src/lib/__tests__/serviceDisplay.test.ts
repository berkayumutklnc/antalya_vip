import { describe, expect, it } from "vitest";
import {
  resolveServiceTypeDisplayName,
  resolveVariantDisplay,
} from "@/lib/public/serviceDisplay";

const SERVICE_TYPES = [
  {
    id: "vip-10",
    nameDe: "VIP Minibus (10 Sitze)",
    nameEn: "VIP Minibus (10 Seats)",
    nameTr: "VIP Minibüs (10 Koltuk)",
    nameRu: "VIP Минибус (10 мест)",
    variants: [
      {
        key: "standard",
        nameDe: "Standard",
        nameEn: "Standard",
        nameTr: "Standart",
        nameRu: "Стандарт",
        priceModifierEur: 0,
      },
      {
        key: "maybach",
        nameDe: "Maybach Paket",
        nameEn: "Maybach Package",
        nameTr: "Maybach Paket",
        nameRu: "Пакет Maybach",
        priceModifierEur: 40,
      },
    ],
  },
];

describe("serviceDisplay", () => {
  it("shows localized service type name instead of raw key", () => {
    const value = resolveServiceTypeDisplayName({
      lang: "en",
      serviceTypeId: "vip-10",
      serviceTypes: SERVICE_TYPES,
    });

    expect(value).toBe("VIP Minibus (10 Seats)");
  });

  it("omits standard variant noise", () => {
    const value = resolveVariantDisplay({
      lang: "en",
      serviceTypeId: "vip-10",
      serviceVariantKey: "standard",
      variantSurchargeEur: 0,
      serviceTypes: SERVICE_TYPES,
    });

    expect(value).toBeNull();
  });

  it("shows maybach variant with clear surcharge", () => {
    const value = resolveVariantDisplay({
      lang: "en",
      serviceTypeId: "vip-10",
      serviceVariantKey: "maybach",
      variantSurchargeEur: 40,
      serviceTypes: SERVICE_TYPES,
    });

    expect(value).toBe("Maybach Package (+€40)");
  });
});
