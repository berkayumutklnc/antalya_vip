"use client";
export default function LocalBusinessJSONLD() {
  const data = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    name: "Sonnenlicht VIP Transfer",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    telephone: "+90 544 685 0705",
    email: "ayseguleraslan147@gmail.com",
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