"use client";

import React from "react";
import { trackWhatsAppClick } from "@/lib/analytics";
import { useI18nPublic } from "@/lib/i18n-public";

const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "";

const DEFAULT_MSGS: Record<string, string> = {
  tr: "Zenturo Travel ile iletişime geçtiğiniz için teşekkür ederiz. Size nasıl yardımcı olabiliriz?",
  en: "Thank you for contacting Zenturo Travel. How can we help you?",
  de: "Vielen Dank, dass Sie Zenturo Travel kontaktiert haben. Wie können wir Ihnen helfen?",
  ru: "Спасибо, что обратились в Zenturo Travel. Чем мы можем вам помочь?",
};

export default function WhatsAppFab() {
  const { lang, t } = useI18nPublic();

  if (!phone) return null;

  const msg = DEFAULT_MSGS[lang] || DEFAULT_MSGS.de;
  const p = phone.replace(/[^\d+]/g, "");
  const href = `https://wa.me/${p}?text=${encodeURIComponent(msg)}`;

  return (
    <a
      href={href}
      target="_blank"
      aria-label={t("whatsapp.ariaLabel")}
      className="fixed z-50 left-4 bottom-4 md:left-6 md:bottom-6 rounded-full shadow-lg border border-emerald-700/40
                 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 flex items-center gap-2"
      onClick={() => trackWhatsAppClick("fab")}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.52 3.48A11.91 11.91 0 0 0 12.06 0C5.5 0 .2 5.29.2 11.82c0 2.08.55 4.12 1.6 5.93L0 24l6.4-1.67a11.8 11.8 0 0 0 5.66 1.45h.01c6.55 0 11.86-5.3 11.86-11.82 0-3.17-1.24-6.15-3.41-8.48zM12.07 21.3h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.8.99 1.02-3.7-.24-.38a9.74 9.74 0 0 1-1.51-5.21c0-5.43 4.45-9.85 9.92-9.85a9.86 9.86 0 0 1 6.98 2.88 9.8 9.8 0 0 1 2.9 6.97c0 5.43-4.45 9.87-9.86 9.87zm5.65-7.37c-.31-.16-1.84-.9-2.13-1-.29-.1-.5-.16-.71.16-.2.31-.82 1-.99 1.2-.18.2-.36.23-.67.08-.31-.15-1.29-.47-2.45-1.5-.9-.79-1.51-1.77-1.69-2.08-.18-.31-.02-.48.13-.64.13-.13.31-.33.46-.49.15-.16.2-.27.31-.46.1-.2.05-.37-.03-.52-.08-.16-.71-1.7-.97-2.33-.26-.62-.52-.54-.71-.55l-.6-.01c-.2 0-.52.07-.8.37s-1.05 1.03-1.05 2.5 1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.43.72.31 1.28.49 1.72.62.72.23 1.37.2 1.88.12.57-.08 1.84-.75 2.1-1.47.26-.72.26-1.33.18-1.47-.07-.14-.28-.23-.59-.39z"/>
      </svg>
      <span className="text-sm font-medium">WhatsApp</span>
    </a>
  );
}
