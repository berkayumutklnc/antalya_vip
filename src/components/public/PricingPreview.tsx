"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PLACES } from "@/config/places";
import { getPublicBookableServiceTypes } from "@/lib/public/serviceCatalog";
import { getLocalizedServiceName } from "@/lib/public/serviceDisplay";

type ServiceTypeItem = {
  id: string;
  nameDe: string;
  nameEn: string;
  nameTr: string;
  nameRu: string;
  isActive?: boolean;
  isBookable?: boolean;
  is_active?: boolean;
  is_bookable?: boolean;
};

const SECTION_TITLE: Record<string, string> = {
  tr: "Servis tipine göre teklifler (Antalya Havalimanı çıkışlı)",
  de: "Angebote nach Service-Typ (ab Flughafen Antalya)",
  en: "Quotes by service type (from Antalya Airport)",
  ru: "Расчёт по типу сервиса (из аэропорта Анталии)",
};

const CTA_LABEL: Record<string, string> = {
  tr: "Teklif al ve rezervasyon talebi gönder",
  de: "Angebot erhalten und Buchungsanfrage senden",
  en: "Get quote and send reservation request",
  ru: "Получить расчёт и отправить заявку",
};

function labelToKey(label: string): string | undefined {
  return PLACES.find((p) => p.label === label)?.id;
}

type PriceEntry = { key: string; price: number };

function toLang(lang: string): "de" | "en" | "tr" | "ru" {
  return lang === "de" || lang === "en" || lang === "tr" || lang === "ru"
    ? lang
    : "en";
}

export default function PricingPreview({
  priceKey,
  lang,
}: {
  priceKey: string;
  lang: string;
}) {
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/public/service-types")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => {
        if (cancelled) return;
        const items = getPublicBookableServiceTypes((data?.items ?? []) as ServiceTypeItem[]);
        setServiceTypes(items);
      })
      .catch(() => {
        if (!cancelled) setServiceTypes([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!serviceTypes.length) {
      setPrices([]);
      return;
    }

    const toKey = labelToKey(priceKey) ?? priceKey.toLowerCase();
    const fromKey = "ayt";
    let cancelled = false;

    Promise.all(
      serviceTypes.map(async (st) => {
        try {
          const res = await fetch(
            `/api/public/route-price?from_key=${encodeURIComponent(fromKey)}&to_key=${encodeURIComponent(toKey)}&vehicle_type=${encodeURIComponent(st.id)}`,
          );
          if (!res.ok) return null;
          const data = await res.json();
          return { key: st.id, price: data.basePriceEur as number };
        } catch {
          return null;
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      const valid: PriceEntry[] = [];
      for (const r of results) {
        if (r) valid.push(r);
      }
      setPrices(valid);
    });

    return () => {
      cancelled = true;
    };
  }, [priceKey, serviceTypes]);

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
            <div className="text-sm text-white/50">
              {(() => {
                const type = serviceTypes.find((st) => st.id === key);
                if (!type) return key;
                return getLocalizedServiceName(type, toLang(lang));
              })()}
            </div>
            <div className="mt-1 text-2xl font-extrabold text-green-400">
              {price}€
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-white/40">
        {lang === "de"
          ? "Richtpreis pro Strecke inkl. MwSt., basierend auf Service-Typ. Paket-/Variantenwahl kann den Endpreis beeinflussen. Keine Online-Zahlung."
          : lang === "en"
            ? "One-way estimate incl. VAT based on service type. Package/variant selection may affect final quote. No online payment."
            : lang === "ru"
              ? "Ориентировочная цена в одну сторону с НДС по типу сервиса. Выбор пакета/варианта может повлиять на финальный расчёт. Онлайн-оплаты нет."
              : "Servis tipine göre tek yön teklif, KDV dahil. Paket/varyant seçimi nihai teklifi etkileyebilir. Online ödeme yok."}
      </p>
      <div className="mt-4 text-center">
        <Link
          href="/#rezervasyon"
          className="inline-block rounded-xl border-2 border-blue-600 bg-transparent px-5 py-2.5 text-sm font-semibold text-blue-400 hover:bg-blue-600 hover:text-white active:scale-95 transition-all duration-200"
        >
          {CTA_LABEL[lang] || CTA_LABEL.en}
        </Link>
      </div>
    </section>
  );
}
