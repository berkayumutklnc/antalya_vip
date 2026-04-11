"use client";
import React from "react";
import { trackWhatsAppClick } from "@/lib/analytics";
import { useI18nPublic } from "@/lib/i18n-public";

const MSGS: Record<string, string> = {
  tr: "Merhaba, rezervasyon yapmak istiyorum",
  en: "Hello, I would like to make a reservation",
  de: "Hallo, ich möchte eine Buchung vornehmen",
  ru: "Здравствуйте, я хочу забронировать",
};

export default function WhatsAppReserveButton({ city }: { city: string }) {
  const { lang, t } = useI18nPublic();
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || process.env.NEXT_PUBLIC_WHATSAPP || "905461909056";
  const msg = encodeURIComponent(MSGS[lang] || MSGS.de);
  const href = `https://wa.me/${phone}?text=${msg}`;

  return (
    <a
      className="inline-block rounded bg-emerald-600 px-5 py-3 font-semibold text-white"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick(city)}
    >
      {t("whatsapp.reserve")}
    </a>
  );
}