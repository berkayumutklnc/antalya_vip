
import type { MetadataRoute } from "next";

// Robots ve sitemap her zaman tek canonical host üzerinden duyurulur.
const CANONICAL_HOST = "https://www.zenturotravel.com.tr";

export default function robots(): MetadataRoute.Robots {
  const base = CANONICAL_HOST;
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
