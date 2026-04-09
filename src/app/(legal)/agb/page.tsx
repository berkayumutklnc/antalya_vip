"use client";

import { useI18nPublic } from "@/lib/i18n-public";

const CONTENT = {
  tr: {
    title: "Genel İşlem Koşulları (GİK)",
    sections: [
      { h: "1. Kapsam", p: "Bu Genel İşlem Koşulları, Zenturo Travel'ın tüm rezervasyon ve hizmetleri için geçerlidir." },
      { h: "2. Sözleşme", p: "Sözleşme, rezervasyonun onaylanmasıyla kurulur. Onay e-posta veya WhatsApp ile gönderilir." },
      { h: "3. Hizmet Kapsamı", p: "Hizmet; belirtilen alış-bırakış noktaları arasında şoför, araç, yakıt ve standart sigorta dahil transfer hizmeti sunar." },
      { h: "4. Fiyat ve Ödeme", p: "Tüm fiyatlar Euro (€) cinsindendir; aksi belirtilmedikçe otopark/gişe ücretleri dahil değildir. Ödeme anlaşmaya göre yerinde veya peşin yapılır." },
      { h: "5. İptal", p: "Transfer saatinden 24 saat öncesine kadar ücretsiz iptal. 24 saat içindeki iptallerde %50 ücret yansıtılır. No-show durumunda tam ücret alınır." },
      { h: "6. Sorumluluk", p: "Şirket yasal çerçevede sorumludur. Mücbir sebepler, doğal afetler ve öngörülemeyen trafik koşulları sorumluluk dışıdır." },
      { h: "7. Gizlilik", p: "Kişisel verilerin işlenmesi Gizlilik Politikamıza uygun olarak yapılır." },
      { h: "8. Son Hükümler", p: "Türkiye Cumhuriyeti hukuku geçerlidir. Yetkili mahkeme Antalya'dır. Herhangi bir hükmün geçersizliği, diğer hükümlerin geçerliliğini etkilemez." },
    ],
  },
  en: {
    title: "General Terms & Conditions (GTC)",
    sections: [
      { h: "1. Scope", p: "These General Terms and Conditions apply to all bookings and services of Zenturo Travel." },
      { h: "2. Contract", p: "The contract is concluded upon confirmation of the booking. Confirmation is sent via email or WhatsApp." },
      { h: "3. Scope of Service", p: "The service includes the agreed transfer between specified pick-up and drop-off points, including driver, vehicle, fuel and standard insurance." },
      { h: "4. Prices & Payment", p: "All prices are in Euro (€) and do not include parking/toll fees unless otherwise agreed. Payment is made on-site or in advance as arranged." },
      { h: "5. Cancellation", p: "Free cancellation up to 24 hours before the transfer. 50% fee for cancellations within 24 hours. Full charge for no-show." },
      { h: "6. Liability", p: "The company is liable within legal limits. Force majeure, natural events and unforeseeable traffic conditions are excluded." },
      { h: "7. Privacy", p: "Personal data processing is carried out in accordance with our Privacy Policy." },
      { h: "8. Final Provisions", p: "The law of the Republic of Turkey applies. Place of jurisdiction is Antalya. Invalidity of individual provisions does not affect the remaining provisions." },
    ],
  },
  de: {
    title: "Allgemeine Geschäftsbedingungen (AGB)",
    sections: [
      { h: "1. Geltungsbereich", p: "Diese Allgemeinen Geschäftsbedingungen gelten für alle Buchungen und Dienstleistungen der Zenturo Travel." },
      { h: "2. Vertragsschluss", p: "Der Vertrag kommt durch die Bestätigung der Buchung zustande. Die Buchungsbestätigung wird per E-Mail oder WhatsApp versendet." },
      { h: "3. Leistungsumfang", p: "Die Leistung umfasst den vereinbarten Transferservice zwischen den angegebenen Abhol- und Zielorten einschließlich Fahrer, Fahrzeug, Kraftstoff und Standardversicherung." },
      { h: "4. Preise und Zahlung", p: "Alle Preise verstehen sich in Euro (€) und beinhalten keine zusätzlichen Parkgebühren oder Mautkosten, sofern nicht anders vereinbart. Die Zahlung erfolgt je nach Vereinbarung vor Ort oder vorab." },
      { h: "5. Stornierung", p: "Kostenlose Stornierung bis 24 Stunden vor dem vereinbarten Transferzeitpunkt. Bei Stornierung innerhalb von 24 Stunden wird eine Gebühr von 50 % berechnet. Bei Nichterscheinen (No-Show) wird der volle Betrag fällig." },
      { h: "6. Haftung", p: "Das Unternehmen haftet im Rahmen der gesetzlichen Bestimmungen. Höhere Gewalt, Naturereignisse und unvorhersehbare Verkehrsbedingungen sind von der Haftung ausgenommen." },
      { h: "7. Datenschutz", p: "Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung." },
      { h: "8. Schlussbestimmungen", p: "Es gilt das Recht der Republik Türkei. Gerichtsstand ist Antalya. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt." },
    ],
  },
  ru: {
    title: "Общие условия (AGB)",
    sections: [
      { h: "1. Область применения", p: "Настоящие Общие условия распространяются на все бронирования и услуги Zenturo Travel." },
      { h: "2. Заключение договора", p: "Договор заключается при подтверждении бронирования. Подтверждение отправляется по e-mail или WhatsApp." },
      { h: "3. Объём услуг", p: "Услуга включает трансфер между указанными точками посадки и высадки, включая водителя, автомобиль, топливо и стандартную страховку." },
      { h: "4. Цены и оплата", p: "Все цены указаны в евро (€) и не включают парковку/платные дороги, если не оговорено иное. Оплата производится на месте или заранее." },
      { h: "5. Отмена", p: "Бесплатная отмена за 24 часа до трансфера. 50% при отмене менее чем за 24 часа. No-show оплачивается полностью." },
      { h: "6. Ответственность", p: "Компания несёт ответственность в рамках закона. Форс-мажор, стихийные бедствия и непредвиденные дорожные условия исключены." },
      { h: "7. Конфиденциальность", p: "Обработка персональных данных осуществляется в соответствии с нашей Политикой конфиденциальности." },
      { h: "8. Заключительные положения", p: "Применяется законодательство Турецкой Республики. Юрисдикция — Анталья. Недействительность отдельных положений не затрагивает остальные." },
    ],
  },
} as const;

export default function AGBPage() {
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