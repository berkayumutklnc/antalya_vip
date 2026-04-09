"use client";

import { SITE } from "@/config/site";
import { useI18nPublic } from "@/lib/i18n-public";

const CONTENT = {
  tr: {
    title: "Yasal Bilgiler",
    legal: "Yasal Bilgiler",
    contact: "İletişim",
    phone: "Telefon",
    email: "E-posta",
    disclaimer: "Sorumluluk Reddi",
    disclaimerText: "Harici bağlantıların içerikleri için sorumluluk kabul edilmez. Bağlantılı sayfaların içeriklerinden ilgili işletmeciler sorumludur.",
    copyright: "Telif Hakkı",
    copyrightText: "Bu sayfalardaki içerik ve eserler Türk telif hakkı mevzuatına tabidir. Üçüncü taraf katkıları ilgili şekilde belirtilmiştir.",
  },
  en: {
    title: "Legal Notice",
    legal: "Legal Notice",
    contact: "Contact",
    phone: "Phone",
    email: "Email",
    disclaimer: "Disclaimer",
    disclaimerText: "We assume no liability for the content of external links. The operators of the linked pages are solely responsible for their content.",
    copyright: "Copyright",
    copyrightText: "The content and works on these pages are subject to Turkish copyright law. Third-party contributions are marked accordingly.",
  },
  de: {
    title: "Impressum",
    legal: "Angaben gemäß § 5 TMG",
    contact: "Kontakt",
    phone: "Telefon",
    email: "E-Mail",
    disclaimer: "Haftungsausschluss",
    disclaimerText: "Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.",
    copyright: "Urheberrecht",
    copyrightText: "Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem türkischen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.",
  },
  ru: {
    title: "Юридическая информация",
    legal: "Юридические сведения",
    contact: "Контакт",
    phone: "Телефон",
    email: "E-mail",
    disclaimer: "Отказ от ответственности",
    disclaimerText: "Мы не несём ответственности за содержание внешних ссылок. За содержание связанных страниц отвечают исключительно их операторы.",
    copyright: "Авторское право",
    copyrightText: "Содержание и произведения на этих страницах защищены турецким авторским правом. Материалы третьих лиц отмечены соответственно.",
  },
} as const;

export default function ImpressumPage() {
  const { lang } = useI18nPublic();
  const c = CONTENT[lang] || CONTENT.de;
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4 text-white/80">
      <h1 className="text-2xl font-semibold text-white">{c.title}</h1>

      <h2 className="text-lg font-semibold text-white">{c.legal}</h2>
      <p>{SITE.name}</p>
      <p>{SITE.address}</p>

      <h2 className="text-lg font-semibold text-white">{c.contact}</h2>
      <p>{c.phone}: {SITE.phone}</p>
      <p>{c.email}: {SITE.email}</p>

      <h2 className="text-lg font-semibold text-white">{c.disclaimer}</h2>
      <p>{c.disclaimerText}</p>

      <h2 className="text-lg font-semibold text-white">{c.copyright}</h2>
      <p>{c.copyrightText}</p>
    </main>
  );
}