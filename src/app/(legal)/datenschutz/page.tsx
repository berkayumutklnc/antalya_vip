"use client";

import { useI18nPublic } from "@/lib/i18n-public";

const CONTENT = {
  tr: {
    title: "Gizlilik Politikası",
    sections: [
      { h: "1. Sorumlu", p: "Zenturo Travel, Yeşilköy, Antalya Havaalanı Dış Hatlar Terminali 1, 07230 Muratpaşa/Antalya, Türkiye. E-posta: info@zenturotravel.com" },
      { h: "2. Toplanan Veriler", p: "Şu kişisel verileri toplar ve işleriz: Ad, e-posta adresi, telefon numarası, uçuş bilgileri, alış-bırakış noktaları ve ödeme bilgileri." },
      { h: "3. İşleme Amacı", p: "Verileriniz yalnızca transfer hizmetinin sunulması, rezervasyonunuzla ilgili iletişim ve yasal yükümlülüklerin yerine getirilmesi için kullanılır." },
      { h: "4. Hukuki Dayanak", p: "İşleme; sözleşmenin ifası, meşru menfaatler ve gerektiğinde açık rızanıza dayanır." },
      { h: "5. Saklama Süresi", p: "Kişisel veriler, sözleşme amacının yerine getirilmesi ve yasal saklama sürelerinin dolmasının ardından silinir." },
      { h: "6. Haklarınız", p: "Bilgi edinme, düzeltme, silme, işlemenin kısıtlanması, veri taşınabilirliği ve itiraz haklarınız vardır. Yukarıdaki e-posta adresine başvurabilirsiniz." },
      { h: "7. Çerezler", p: "Web sitemiz dil ayarı için işlevsel çerezler kullanır. Analiz çerezleri (Google Analytics) yalnızca onayınızla ayarlanır." },
    ],
  },
  en: {
    title: "Privacy Policy",
    sections: [
      { h: "1. Controller", p: "Zenturo Travel, Yeşilköy, Antalya Havaalanı Dış Hatlar Terminali 1, 07230 Muratpaşa/Antalya, Turkey. Email: info@zenturotravel.com" },
      { h: "2. Data Collected", p: "We collect and process the following personal data: name, email address, phone number, flight information, pick-up and drop-off points, and payment information." },
      { h: "3. Purpose", p: "Your data is used solely for providing the booked transfer service, communication regarding your booking, and fulfilling legal obligations." },
      { h: "4. Legal Basis", p: "Processing is based on contract performance, legitimate interests, and where applicable, your consent." },
      { h: "5. Retention", p: "Personal data is deleted after the contractual purpose is fulfilled and statutory retention periods expire." },
      { h: "6. Your Rights", p: "You have the right to access, rectification, erasure, restriction of processing, data portability, and objection. Contact us at the email above." },
      { h: "7. Cookies", p: "Our website uses functional cookies for language settings. Analytics cookies (Google Analytics) are only set with your consent." },
    ],
  },
  de: {
    title: "Datenschutzerklärung",
    sections: [
      { h: "1. Verantwortlicher", p: "Zenturo Travel, Yeşilköy, Antalya Havaalanı Dış Hatlar Terminali 1, 07230 Muratpaşa/Antalya, Türkei. E-Mail: info@zenturotravel.com" },
      { h: "2. Erhobene Daten", p: "Wir erheben und verarbeiten folgende personenbezogene Daten: Name, E-Mail-Adresse, Telefonnummer, Fluginformationen, Abhol- und Zielorte sowie Zahlungsinformationen." },
      { h: "3. Zweck der Verarbeitung", p: "Ihre Daten werden ausschließlich zur Erbringung des gebuchten Transferservices, zur Kommunikation bezüglich Ihrer Buchung sowie zur Erfüllung gesetzlicher Pflichten verwendet." },
      { h: "4. Rechtsgrundlage", p: "Die Verarbeitung erfolgt auf Grundlage der Vertragserfüllung (DSGVO Art. 6 Abs. 1 lit. b) sowie berechtigter Interessen (Art. 6 Abs. 1 lit. f) und ggf. Ihrer Einwilligung (Art. 6 Abs. 1 lit. a)." },
      { h: "5. Speicherdauer", p: "Personenbezogene Daten werden nach Erfüllung des Vertragszwecks und Ablauf gesetzlicher Aufbewahrungsfristen gelöscht." },
      { h: "6. Ihre Rechte", p: "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wenden Sie sich hierzu an die oben genannte E-Mail-Adresse." },
      { h: "7. Cookies", p: "Unsere Website verwendet funktionale Cookies zur Spracheinstellung. Analyse-Cookies (Google Analytics) werden nur mit Ihrer Einwilligung gesetzt." },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    sections: [
      { h: "1. Ответственный", p: "Zenturo Travel, Yeşilköy, Antalya Havaalanı Dış Hatlar Terminali 1, 07230 Muratpaşa/Antalya, Турция. E-mail: info@zenturotravel.com" },
      { h: "2. Собираемые данные", p: "Мы собираем и обрабатываем: имя, e-mail, телефон, данные рейса, точки посадки/высадки и платёжные данные." },
      { h: "3. Цель обработки", p: "Ваши данные используются исключительно для предоставления трансфера, коммуникации по бронированию и выполнения юридических обязательств." },
      { h: "4. Правовая основа", p: "Обработка основана на исполнении договора, законных интересах и, при необходимости, вашем согласии." },
      { h: "5. Срок хранения", p: "Персональные данные удаляются после выполнения договорной цели и истечения установленных законом сроков хранения." },
      { h: "6. Ваши права", p: "Вы имеете право на доступ, исправление, удаление, ограничение обработки, переносимость данных и возражение. Обращайтесь по e-mail выше." },
      { h: "7. Файлы cookie", p: "Наш сайт использует функциональные cookie для языковых настроек. Аналитические cookie (Google Analytics) устанавливаются только с вашего согласия." },
    ],
  },
} as const;

export default function DatenschutzPage() {
  const { lang } = useI18nPublic();
  const c = CONTENT[lang] || CONTENT.de;
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4 text-white/80">
      <h1 className="text-2xl font-semibold text-white">{c.title}</h1>
      {c.sections.map((s) => (
        <div key={s.h}>
          <h2 className="text-lg font-semibold text-white">{s.h}</h2>
          <p>{s.p}</p>
        </div>
      ))}
    </main>
  );
}