export const SITE = {
  /** Full brand name used in headers, footers, and metadata */
  name: "Zenturo Travel",
  /** Short brand used in title templates like "%s | Zenturo" */
  shortName: "Zenturo",
  /** Legal entity name for impressum / AGB / contracts */
  legalName: "Zenturo Travel",

  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://zenturotravel.com",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+905461909056",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "+905461909056",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "semirgultopluyan7@gmail.com",
  address:
    "Side Mahallesi, Side Caddesi, No: 42, Manavgat / ANTALYA",

  defaultLang: (process.env.NEXT_PUBLIC_DEFAULT_LANG as "de" | "en" | "tr" | "ru") ?? "de",
  supportedLangs: ["de", "en", "tr", "ru"] as const,
} as const;
