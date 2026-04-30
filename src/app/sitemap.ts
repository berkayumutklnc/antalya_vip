
import type { MetadataRoute } from "next";
import { getAllTransferSlugs } from "@/content/transfers";

const staticRoutes = [
  "/", "/rezervasyon", "/rezervasyonumu-gor", "/about", "/faq",
  "/impressum", "/datenschutz", "/agb",
  "/policies/cancellation", "/policies/privacy",
];

// Sitemap her zaman tek canonical host üzerinden yayınlanır.
// Google Search Console üzerinden bu domain ile gönderilmeli.
const CANONICAL_HOST = "https://www.zenturotravel.com.tr";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = CANONICAL_HOST;
  const now = new Date();
  const langs = ["de", "en", "tr", "ru"] as const;

  const transferSlugs = getAllTransferSlugs();
  const transferRoutes = transferSlugs.map((s) => `/${s}`);

  const allRoutes = [...staticRoutes, ...transferRoutes];

  return allRoutes.map((p) => {
    const isTransfer = p.includes("transfer");
    const isHome = p === "/";
    const priority = isHome ? 1 : isTransfer ? 0.9 : 0.6;

    const alternates: Record<string, string> = {};
    for (const lang of langs) {
      alternates[lang] = `${base}${p}?lang=${lang}`;
    }

    return {
      url: `${base}${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
      alternates: { languages: alternates },
    };
  });
}
