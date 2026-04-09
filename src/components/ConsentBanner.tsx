"use client";

import { useEffect, useState } from "react";
import { getConsent, setConsent, type ConsentValue } from "@/lib/consent";
import { useI18nPublic } from "@/lib/i18n-public";

const TEXTS = {
  tr: { msg: "Bu web sitesi analiz amaçlı çerezler kullanmaktadır. Detaylar için", link: "Gizlilik Politikası", deny: "Reddet", accept: "Kabul Et" },
  en: { msg: "This website uses cookies for analytics. Learn more in our", link: "Privacy Policy", deny: "Decline", accept: "Accept" },
  de: { msg: "Diese Website verwendet Cookies zur Analyse. Weitere Informationen finden Sie in unserer", link: "Datenschutzerklärung", deny: "Ablehnen", accept: "Akzeptieren" },
  ru: { msg: "Этот сайт использует файлы cookie для аналитики. Подробнее в нашей", link: "Политике конфиденциальности", deny: "Отклонить", accept: "Принять" },
} as const;

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const { lang } = useI18nPublic();
  const txt = TEXTS[lang] || TEXTS.de;

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  function handle(value: ConsentValue) {
    setConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] bg-neutral-900/95 border-t border-white/10 p-4 md:p-6">
      <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-start md:items-center gap-4">
        <p className="text-sm text-neutral-300 flex-1">
          {txt.msg}{" "}
          <a href="/datenschutz" className="underline text-blue-400">
            {txt.link}
          </a>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => handle("denied")}
            className="px-4 py-2 text-sm rounded border border-white/20 hover:bg-white/10"
          >
            {txt.deny}
          </button>
          <button
            onClick={() => handle("granted")}
            className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            {txt.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
