"use client";

import { pricingMatrix } from "@/lib/pricing";

const VEHICLE_LABELS: Record<string, Record<string, string>> = {
  tr: { "vip-6": "VIP 6 Kişilik", "vip-10": "VIP 10 Kişilik", "vip-16": "VIP 16 Kişilik" },
  de: { "vip-6": "VIP 6 Sitze", "vip-10": "VIP 10 Sitze", "vip-16": "VIP 16 Sitze" },
  en: { "vip-6": "VIP 6-Seat", "vip-10": "VIP 10-Seat", "vip-16": "VIP 16-Seat" },
  ru: { "vip-6": "VIP 6 мест", "vip-10": "VIP 10 мест", "vip-16": "VIP 16 мест" },
};

const SECTION_TITLE: Record<string, string> = {
  tr: "Fiyatlar (Antalya Havalimanı çıkışlı)",
  de: "Preise (ab Flughafen Antalya)",
  en: "Pricing (from Antalya Airport)",
  ru: "Цены (из аэропорта Анталии)",
};

export default function PricingPreview({
  priceKey,
  lang,
}: {
  priceKey: string;
  lang: string;
}) {
  // Look in the AYT row first, then check if priceKey itself is a from-key
  const aytRow = pricingMatrix["Antalya Airport (AYT)"];
  const priceObj = aytRow?.[priceKey] ?? pricingMatrix[priceKey]?.["Antalya Airport (AYT)"];
  if (!priceObj) return null;

  const vehicles = VEHICLE_LABELS[lang] || VEHICLE_LABELS.en;
  const prices = (["vip-6", "vip-10", "vip-16"] as const)
    .map((key) => ({ key, price: priceObj[key] }))
    .filter((p) => p.price != null);

  if (!prices.length) return null;

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">{SECTION_TITLE[lang] || SECTION_TITLE.en}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {prices.map(({ key, price }) => (
          <div
            key={key}
            className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-center"
          >
            <div className="text-sm text-white/50">{vehicles[key] || key}</div>
            <div className="mt-1 text-2xl font-extrabold text-green-400">
              {price}€
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-white/40">
        {lang === "de"
          ? "Einmaliger Festpreis (hin), inkl. MwSt. • Nachtfahrt & Wartezeit inklusive."
          : lang === "en"
            ? "One-way fixed price, incl. VAT. Night rides & waiting time included."
            : lang === "ru"
              ? "Фиксированная цена в одну сторону, вкл. НДС. Ночные поездки и ожидание включены."
              : "Tek yön sabit fiyat, KDV dahil. Gece seferi ve bekleme süresi fiyata dahildir."}
      </p>
    </section>
  );
}
