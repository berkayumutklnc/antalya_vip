"use client";

import { useI18nPublic } from "@/lib/i18n-public";

const FAQ_DATA: Record<string, { q: string; a: string }[]> = {
  de: [
    { q: "Wie funktioniert die Abholung am Flughafen Antalya?", a: "Wir verfolgen Ihren Flug; der Fahrer empfängt Sie am Terminalausgang mit einem Namensschild." },
    { q: "Gibt es einen Aufpreis für Nachtflüge?", a: "Nein. 24/7 Festpreis; keine versteckten Kosten." },
    { q: "Stellen Sie Kindersitze zur Verfügung?", a: "Ja, auf Anfrage kostenlos." },
  ],
  en: [
    { q: "How does the Antalya Airport meet & greet work?", a: "We track your flight; the driver meets you at the terminal exit with a name board." },
    { q: "Is there an extra charge for night flights?", a: "No. 24/7 fixed price; no hidden fees." },
    { q: "Do you provide child seats?", a: "Yes, free of charge upon request." },
  ],
  tr: [
    { q: "Antalya Havalimanı'nda karşılama nasıl?", a: "Uçuş takibi yapıyoruz; şoför terminal çıkışında isim panosu ile karşılar." },
    { q: "Gece uçuşlarında ek ücret var mı?", a: "Hayır. 7/24 sabit fiyat; gizli ücret yok." },
    { q: "Çocuk koltuğu veriyor musunuz?", a: "Evet, talep üzerine ücretsiz sağlıyoruz." },
  ],
  ru: [
    { q: "Как проходит встреча в аэропорту Анталии?", a: "Мы отслеживаем ваш рейс; водитель встретит вас на выходе из терминала с табличкой." },
    { q: "Есть ли доплата за ночные рейсы?", a: "Нет. Фиксированная цена 24/7; без скрытых платежей." },
    { q: "Вы предоставляете детские кресла?", a: "Да, бесплатно по запросу." },
  ],
};

export default function FAQJSONLD() {
  const { lang } = useI18nPublic();
  const faqs = FAQ_DATA[lang] || FAQ_DATA.de;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}