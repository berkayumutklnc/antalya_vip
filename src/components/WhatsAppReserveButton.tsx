"use client";
import React from "react";

export default function WhatsAppReserveButton({ city }: { city: string }) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "905541790203";
  const msg = encodeURIComponent(process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Merhaba, rezervasyon yapmak istiyorum");
  const href = `https://wa.me/${phone}?text=${msg}`;

  return (
    <a
      className="inline-block rounded bg-emerald-600 px-5 py-3 font-semibold text-white"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => (window as any).gtag?.("event", "whatsapp_click", { location: city })}
    >
      WhatsApp’tan Rezervasyon
    </a>
  );
}
