"use client";

import { useI18nPublic } from "@/lib/i18n-public";

const CONTENT = {
  tr: {
    title: "Gizlilik PolitikasÄ±",
    sections: [
      { h: "1. Sorumlu", p: "Zenturo Travel, YeÅŸilkÃ¶y, Antalya HavaalanÄ± DÄ±ÅŸ Hatlar Terminali 1, 07230 MuratpaÅŸa/Antalya, TÃ¼rkiye. E-posta: semirgultopluyan7@gmail.com" },
      { h: "2. Toplanan Veriler", p: "Åu kiÅŸisel verileri toplar ve iÅŸleriz: Ad, e-posta adresi, telefon numarasÄ±, uÃ§uÅŸ bilgileri, alÄ±ÅŸ-bÄ±rakÄ±ÅŸ noktalarÄ± ve Ã¶deme bilgileri." },
      { h: "3. Ä°ÅŸleme AmacÄ±", p: "Verileriniz yalnÄ±zca transfer hizmetinin sunulmasÄ±, rezervasyonunuzla ilgili iletiÅŸim ve yasal yÃ¼kÃ¼mlÃ¼lÃ¼klerin yerine getirilmesi iÃ§in kullanÄ±lÄ±r." },
      { h: "4. Hukuki Dayanak", p: "Ä°ÅŸleme; sÃ¶zleÅŸmenin ifasÄ±, meÅŸru menfaatler ve gerektiÄŸinde aÃ§Ä±k rÄ±zanÄ±za dayanÄ±r." },
      { h: "5. Saklama SÃ¼resi", p: "KiÅŸisel veriler, sÃ¶zleÅŸme amacÄ±nÄ±n yerine getirilmesi ve yasal saklama sÃ¼relerinin dolmasÄ±nÄ±n ardÄ±ndan silinir." },
      { h: "6. HaklarÄ±nÄ±z", p: "Bilgi edinme, dÃ¼zeltme, silme, iÅŸlemenin kÄ±sÄ±tlanmasÄ±, veri taÅŸÄ±nabilirliÄŸi ve itiraz haklarÄ±nÄ±z vardÄ±r. YukarÄ±daki e-posta adresine baÅŸvurabilirsiniz." },
      { h: "7. Ã‡erezler", p: "Web sitemiz dil ayarÄ± iÃ§in iÅŸlevsel Ã§erezler kullanÄ±r. Analiz Ã§erezleri (Google Analytics) yalnÄ±zca onayÄ±nÄ±zla ayarlanÄ±r." },
    ],
  },
  en: {
    title: "Privacy Policy",
    sections: [
      { h: "1. Controller", p: "Zenturo Travel, YeÅŸilkÃ¶y, Antalya HavaalanÄ± DÄ±ÅŸ Hatlar Terminali 1, 07230 MuratpaÅŸa/Antalya, Turkey. Email: semirgultopluyan7@gmail.com" },
      { h: "2. Data Collected", p: "We collect and process the following personal data: name, email address, phone number, flight information, pick-up and drop-off points, and payment information." },
      { h: "3. Purpose", p: "Your data is used solely for providing the booked transfer service, communication regarding your booking, and fulfilling legal obligations." },
      { h: "4. Legal Basis", p: "Processing is based on contract performance, legitimate interests, and where applicable, your consent." },
      { h: "5. Retention", p: "Personal data is deleted after the contractual purpose is fulfilled and statutory retention periods expire." },
      { h: "6. Your Rights", p: "You have the right to access, rectification, erasure, restriction of processing, data portability, and objection. Contact us at the email above." },
      { h: "7. Cookies", p: "Our website uses functional cookies for language settings. Analytics cookies (Google Analytics) are only set with your consent." },
    ],
  },
  de: {
    title: "DatenschutzerklÃ¤rung",
    sections: [
      { h: "1. Verantwortlicher", p: "Zenturo Travel, YeÅŸilkÃ¶y, Antalya HavaalanÄ± DÄ±ÅŸ Hatlar Terminali 1, 07230 MuratpaÅŸa/Antalya, TÃ¼rkei. E-Mail: semirgultopluyan7@gmail.com" },
      { h: "2. Erhobene Daten", p: "Wir erheben und verarbeiten folgende personenbezogene Daten: Name, E-Mail-Adresse, Telefonnummer, Fluginformationen, Abhol- und Zielorte sowie Zahlungsinformationen." },
      { h: "3. Zweck der Verarbeitung", p: "Ihre Daten werden ausschlieÃŸlich zur Erbringung des gebuchten Transferservices, zur Kommunikation bezÃ¼glich Ihrer Buchung sowie zur ErfÃ¼llung gesetzlicher Pflichten verwendet." },
      { h: "4. Rechtsgrundlage", p: "Die Verarbeitung erfolgt auf Grundlage der VertragserfÃ¼llung (DSGVO Art. 6 Abs. 1 lit. b) sowie berechtigter Interessen (Art. 6 Abs. 1 lit. f) und ggf. Ihrer Einwilligung (Art. 6 Abs. 1 lit. a)." },
      { h: "5. Speicherdauer", p: "Personenbezogene Daten werden nach ErfÃ¼llung des Vertragszwecks und Ablauf gesetzlicher Aufbewahrungsfristen gelÃ¶scht." },
      { h: "6. Ihre Rechte", p: "Sie haben das Recht auf Auskunft, Berichtigung, LÃ¶schung, EinschrÃ¤nkung der Verarbeitung, DatenÃ¼bertragbarkeit und Widerspruch. Wenden Sie sich hierzu an die oben genannte E-Mail-Adresse." },
      { h: "7. Cookies", p: "Unsere Website verwendet funktionale Cookies zur Spracheinstellung. Analyse-Cookies (Google Analytics) werden nur mit Ihrer Einwilligung gesetzt." },
    ],
  },
  ru: {
    title: "ĞŸĞ¾Ğ»Ğ¸Ñ‚Ğ¸ĞºĞ° ĞºĞ¾Ğ½Ñ„Ğ¸Ğ´ĞµĞ½Ñ†Ğ¸Ğ°Ğ»ÑŒĞ½Ğ¾ÑÑ‚Ğ¸",
    sections: [
      { h: "1. ĞÑ‚Ğ²ĞµÑ‚ÑÑ‚Ğ²ĞµĞ½Ğ½Ñ‹Ğ¹", p: "Zenturo Travel, YeÅŸilkÃ¶y, Antalya HavaalanÄ± DÄ±ÅŸ Hatlar Terminali 1, 07230 MuratpaÅŸa/Antalya, Ğ¢ÑƒÑ€Ñ†Ğ¸Ñ. E-mail: semirgultopluyan7@gmail.com" },
      { h: "2. Ğ¡Ğ¾Ğ±Ğ¸Ñ€Ğ°ĞµĞ¼Ñ‹Ğµ Ğ´Ğ°Ğ½Ğ½Ñ‹Ğµ", p: "ĞœÑ‹ ÑĞ¾Ğ±Ğ¸Ñ€Ğ°ĞµĞ¼ Ğ¸ Ğ¾Ğ±Ñ€Ğ°Ğ±Ğ°Ñ‚Ñ‹Ğ²Ğ°ĞµĞ¼: Ğ¸Ğ¼Ñ, e-mail, Ñ‚ĞµĞ»ĞµÑ„Ğ¾Ğ½, Ğ´Ğ°Ğ½Ğ½Ñ‹Ğµ Ñ€ĞµĞ¹ÑĞ°, Ñ‚Ğ¾Ñ‡ĞºĞ¸ Ğ¿Ğ¾ÑĞ°Ğ´ĞºĞ¸/Ğ²Ñ‹ÑĞ°Ğ´ĞºĞ¸ Ğ¸ Ğ¿Ğ»Ğ°Ñ‚Ñ‘Ğ¶Ğ½Ñ‹Ğµ Ğ´Ğ°Ğ½Ğ½Ñ‹Ğµ." },
      { h: "3. Ğ¦ĞµĞ»ÑŒ Ğ¾Ğ±Ñ€Ğ°Ğ±Ğ¾Ñ‚ĞºĞ¸", p: "Ğ’Ğ°ÑˆĞ¸ Ğ´Ğ°Ğ½Ğ½Ñ‹Ğµ Ğ¸ÑĞ¿Ğ¾Ğ»ÑŒĞ·ÑƒÑÑ‚ÑÑ Ğ¸ÑĞºĞ»ÑÑ‡Ğ¸Ñ‚ĞµĞ»ÑŒĞ½Ğ¾ Ğ´Ğ»Ñ Ğ¿Ñ€ĞµĞ´Ğ¾ÑÑ‚Ğ°Ğ²Ğ»ĞµĞ½Ğ¸Ñ Ñ‚Ñ€Ğ°Ğ½ÑÑ„ĞµÑ€Ğ°, ĞºĞ¾Ğ¼Ğ¼ÑƒĞ½Ğ¸ĞºĞ°Ñ†Ğ¸Ğ¸ Ğ¿Ğ¾ Ğ±Ñ€Ğ¾Ğ½Ğ¸Ñ€Ğ¾Ğ²Ğ°Ğ½Ğ¸Ñ Ğ¸ Ğ²Ñ‹Ğ¿Ğ¾Ğ»Ğ½ĞµĞ½Ğ¸Ñ ÑÑ€Ğ¸Ğ´Ğ¸Ñ‡ĞµÑĞºĞ¸Ñ… Ğ¾Ğ±ÑĞ·Ğ°Ñ‚ĞµĞ»ÑŒÑÑ‚Ğ²." },
      { h: "4. ĞŸÑ€Ğ°Ğ²Ğ¾Ğ²Ğ°Ñ Ğ¾ÑĞ½Ğ¾Ğ²Ğ°", p: "ĞĞ±Ñ€Ğ°Ğ±Ğ¾Ñ‚ĞºĞ° Ğ¾ÑĞ½Ğ¾Ğ²Ğ°Ğ½Ğ° Ğ½Ğ° Ğ¸ÑĞ¿Ğ¾Ğ»Ğ½ĞµĞ½Ğ¸Ğ¸ Ğ´Ğ¾Ğ³Ğ¾Ğ²Ğ¾Ñ€Ğ°, Ğ·Ğ°ĞºĞ¾Ğ½Ğ½Ñ‹Ñ… Ğ¸Ğ½Ñ‚ĞµÑ€ĞµÑĞ°Ñ… Ğ¸, Ğ¿Ñ€Ğ¸ Ğ½ĞµĞ¾Ğ±Ñ…Ğ¾Ğ´Ğ¸Ğ¼Ğ¾ÑÑ‚Ğ¸, Ğ²Ğ°ÑˆĞµĞ¼ ÑĞ¾Ğ³Ğ»Ğ°ÑĞ¸Ğ¸." },
      { h: "5. Ğ¡Ñ€Ğ¾Ğº Ñ…Ñ€Ğ°Ğ½ĞµĞ½Ğ¸Ñ", p: "ĞŸĞµÑ€ÑĞ¾Ğ½Ğ°Ğ»ÑŒĞ½Ñ‹Ğµ Ğ´Ğ°Ğ½Ğ½Ñ‹Ğµ ÑƒĞ´Ğ°Ğ»ÑÑÑ‚ÑÑ Ğ¿Ğ¾ÑĞ»Ğµ Ğ²Ñ‹Ğ¿Ğ¾Ğ»Ğ½ĞµĞ½Ğ¸Ñ Ğ´Ğ¾Ğ³Ğ¾Ğ²Ğ¾Ñ€Ğ½Ğ¾Ğ¹ Ñ†ĞµĞ»Ğ¸ Ğ¸ Ğ¸ÑÑ‚ĞµÑ‡ĞµĞ½Ğ¸Ñ ÑƒÑÑ‚Ğ°Ğ½Ğ¾Ğ²Ğ»ĞµĞ½Ğ½Ñ‹Ñ… Ğ·Ğ°ĞºĞ¾Ğ½Ğ¾Ğ¼ ÑÑ€Ğ¾ĞºĞ¾Ğ² Ñ…Ñ€Ğ°Ğ½ĞµĞ½Ğ¸Ñ." },
      { h: "6. Ğ’Ğ°ÑˆĞ¸ Ğ¿Ñ€Ğ°Ğ²Ğ°", p: "Ğ’Ñ‹ Ğ¸Ğ¼ĞµĞµÑ‚Ğµ Ğ¿Ñ€Ğ°Ğ²Ğ¾ Ğ½Ğ° Ğ´Ğ¾ÑÑ‚ÑƒĞ¿, Ğ¸ÑĞ¿Ñ€Ğ°Ğ²Ğ»ĞµĞ½Ğ¸Ğµ, ÑƒĞ´Ğ°Ğ»ĞµĞ½Ğ¸Ğµ, Ğ¾Ğ³Ñ€Ğ°Ğ½Ğ¸Ñ‡ĞµĞ½Ğ¸Ğµ Ğ¾Ğ±Ñ€Ğ°Ğ±Ğ¾Ñ‚ĞºĞ¸, Ğ¿ĞµÑ€ĞµĞ½Ğ¾ÑĞ¸Ğ¼Ğ¾ÑÑ‚ÑŒ Ğ´Ğ°Ğ½Ğ½Ñ‹Ñ… Ğ¸ Ğ²Ğ¾Ğ·Ñ€Ğ°Ğ¶ĞµĞ½Ğ¸Ğµ. ĞĞ±Ñ€Ğ°Ñ‰Ğ°Ğ¹Ñ‚ĞµÑÑŒ Ğ¿Ğ¾ e-mail Ğ²Ñ‹ÑˆĞµ." },
      { h: "7. Ğ¤Ğ°Ğ¹Ğ»Ñ‹ cookie", p: "ĞĞ°Ñˆ ÑĞ°Ğ¹Ñ‚ Ğ¸ÑĞ¿Ğ¾Ğ»ÑŒĞ·ÑƒĞµÑ‚ Ñ„ÑƒĞ½ĞºÑ†Ğ¸Ğ¾Ğ½Ğ°Ğ»ÑŒĞ½Ñ‹Ğµ cookie Ğ´Ğ»Ñ ÑĞ·Ñ‹ĞºĞ¾Ğ²Ñ‹Ñ… Ğ½Ğ°ÑÑ‚Ñ€Ğ¾ĞµĞº. ĞĞ½Ğ°Ğ»Ğ¸Ñ‚Ğ¸Ñ‡ĞµÑĞºĞ¸Ğµ cookie (Google Analytics) ÑƒÑÑ‚Ğ°Ğ½Ğ°Ğ²Ğ»Ğ¸Ğ²Ğ°ÑÑ‚ÑÑ Ñ‚Ğ¾Ğ»ÑŒĞºĞ¾ Ñ Ğ²Ğ°ÑˆĞµĞ³Ğ¾ ÑĞ¾Ğ³Ğ»Ğ°ÑĞ¸Ñ." },
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