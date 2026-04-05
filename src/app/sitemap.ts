
import type { MetadataRoute } from "next";

const routes = [
  "/", "/rezervasyon", "/rezervasyonumu-gor", "/about", "/faq",
  "/impressum", "/datenschutz", "/agb",

  "/antalya-havalimani-transfer", "/vip-transfer-antalya",
  "/belek-transfer", "/kemer-transfer", "/lara-transfer",
  "/side-transfer", "/alanya-transfer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sonnenlichttransfer.com";
  const now = new Date();
  return routes.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1 : p.includes("transfer") ? 0.9 : 0.6,
  }));
}
