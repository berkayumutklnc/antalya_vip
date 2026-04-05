"use client";
import { SITE } from "@/config/site";

export default function LocalBusinessJSONLD() {
  const data = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    name: SITE.name,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    areaServed: ["Antalya","Antalya Airport","Lara","Kundu","Belek","Side","Alanya","Kemer"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Yeşilköy, Antalya Havaalanı Dış Hatlar Terminali 1",
      addressLocality: "Muratpaşa",
      addressRegion: "Antalya",
      postalCode: "07230",
      addressCountry: "TR",
    },
    openingHours: "Mo-Su 00:00-23:59",
    priceRange: "$$",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}