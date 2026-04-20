type Lang = "de" | "en" | "tr" | "ru";

type LocalizedName = {
  nameDe: string;
  nameEn: string;
  nameTr: string;
  nameRu: string;
};

export type ServiceTypeDisplayItem = LocalizedName & {
  id: string;
  variants?: Array<
    LocalizedName & {
      key: string;
      priceModifierEur?: number;
    }
  >;
};

function titleCaseFromKey(s: string): string {
  return s
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function standardLabel(lang: Lang): string {
  switch (lang) {
    case "tr":
      return "Standart";
    case "de":
      return "Standard";
    case "ru":
      return "Стандарт";
    case "en":
    default:
      return "Standard";
  }
}

export function getLocalizedServiceName(item: LocalizedName, lang: Lang): string {
  switch (lang) {
    case "tr":
      return item.nameTr;
    case "de":
      return item.nameDe;
    case "ru":
      return item.nameRu;
    case "en":
    default:
      return item.nameEn;
  }
}

export function resolveServiceTypeDisplayName(args: {
  lang: Lang;
  serviceTypeId?: string;
  vehicleType?: string;
  serviceTypes?: ServiceTypeDisplayItem[];
}): string | null {
  const key = args.serviceTypeId || args.vehicleType;
  if (!key) return null;

  const match = (args.serviceTypes ?? []).find((s) => s.id === key);
  if (match) return getLocalizedServiceName(match, args.lang);

  if (key.toLowerCase().startsWith("vip-")) {
    const seats = key.slice(4);
    if (args.lang === "tr") return `VIP ${seats} Kisilik`;
    if (args.lang === "de") return `VIP ${seats} Sitze`;
    if (args.lang === "ru") return `VIP ${seats} mest`;
    return `VIP ${seats} Seats`;
  }

  return titleCaseFromKey(key);
}

export function resolveVariantDisplay(args: {
  lang: Lang;
  serviceTypeId?: string;
  serviceVariantKey?: string;
  variantSurchargeEur?: number;
  serviceTypes?: ServiceTypeDisplayItem[];
}): string | null {
  const key = args.serviceVariantKey;
  if (!key) return null;

  const type = (args.serviceTypes ?? []).find((s) => s.id === args.serviceTypeId);
  const variant = type?.variants?.find((v) => v.key === key);
  const name = variant
    ? getLocalizedServiceName(variant, args.lang)
    : key === "standard"
      ? standardLabel(args.lang)
      : titleCaseFromKey(key);
  const surcharge = Number(args.variantSurchargeEur ?? variant?.priceModifierEur ?? 0);

  if (surcharge > 0) {
    return `${name} (+€${surcharge})`;
  }
  return name;
}
