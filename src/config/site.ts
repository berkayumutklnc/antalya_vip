export const SITE = {
  name: "Sonnenlicht VIP Transfer",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  phone: "+905541790203",
  whatsapp: "+905541790203",
  email: "berkayumut98@gmail.com",
  address: "Yeşilköy, Antalya Havaalanı Dış Hatlar Terminali 1, 07230 Muratpaşa/Antalya",
  defaultLang: (process.env.NEXT_PUBLIC_DEFAULT_LANG as "de"|"en"|"tr"|"ru") ?? "de",
} as const;
