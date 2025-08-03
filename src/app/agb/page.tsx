'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AGBPage() {
  const { language } = useLanguage();

  const content = {
    de: {
      title: 'Allgemeine Geschäftsbedingungen',
      lastUpdated: 'Zuletzt aktualisiert: 1. Januar 2024'
    },
    en: {
      title: 'Terms and Conditions',
      lastUpdated: 'Last updated: January 1, 2024'
    },
    tr: {
      title: 'Kullanım Şartları',
      lastUpdated: 'Son güncelleme: 1 Ocak 2024'
    },
    ru: {
      title: 'Условия использования',
      lastUpdated: 'Последнее обновление: 1 января 2024'
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md border border-[#0F1E3C]/20 p-8">
          <h1 className="text-3xl font-bold text-[#1F2937] mb-4">
            {currentContent.title}
          </h1>
          <p className="text-[#1F2937] mb-8">
            {currentContent.lastUpdated}
          </p>
          
          <div className="space-y-6 text-[#1F2937]">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#0F1E3C]">
                {language === 'de' ? '§1 Geltungsbereich' : '§1 Scope'}
              </h2>
              <p className="mb-4">
                {language === 'de' && 'Diese Allgemeinen Geschäftsbedingungen gelten für alle Reservierungen und Buchungen von VIP-Transfer-Dienstleistungen der Antalya VIP Transfer GmbH.'}
                {language === 'en' && 'These General Terms and Conditions apply to all reservations and bookings of VIP transfer services by Antalya VIP Transfer GmbH.'}
                {language === 'tr' && 'Bu Genel Kullanım Şartları, Antalya VIP Transfer GmbH\'nin VIP transfer hizmetlerinin tüm rezervasyonları ve biletleri için geçerlidir.'}
                {language === 'ru' && 'Эти Общие условия использования применяются ко всем бронированиям и заказам VIP трансферных услуг компании Antalya VIP Transfer GmbH.'}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#0F1E3C]">
                {language === 'de' ? '§2 Leistungsbeschreibung' : '§2 Service Description'}
              </h2>
              <p className="mb-4">
                {language === 'de' && 'Wir bieten VIP-Transfer-Dienstleistungen zwischen verschiedenen Standorten in Antalya an, einschließlich Flughafen-Transfers und Hotel-Transfers.'}
                {language === 'en' && 'We offer VIP transfer services between various locations in Antalya, including airport transfers and hotel transfers.'}
                {language === 'tr' && 'Antalya\'daki çeşitli lokasyonlar arasında VIP transfer hizmetleri sunuyoruz, havaalanı transferleri ve otel transferleri dahil.'}
                {language === 'ru' && 'Мы предлагаем VIP трансферные услуги между различными местами в Анталье, включая трансферы в аэропорт и трансферы в отель.'}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#0F1E3C]">
                {language === 'de' ? '§3 Buchung und Reservierung' : '§3 Booking and Reservation'}
              </h2>
              <p className="mb-4">
                {language === 'de' && 'Reservierungen können online über unsere Website oder telefonisch vorgenommen werden. Eine Bestätigung wird per E-Mail versendet.'}
                {language === 'en' && 'Reservations can be made online through our website or by phone. A confirmation will be sent by email.'}
                {language === 'tr' && 'Rezervasyonlar web sitemiz üzerinden online veya telefonla yapılabilir. Onay e-posta ile gönderilir.'}
                {language === 'ru' && 'Бронирования можно сделать онлайн через наш веб-сайт или по телефону. Подтверждение будет отправлено по электронной почте.'}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#0F1E3C]">
                {language === 'de' ? '§4 Stornierung' : '§4 Cancellation'}
              </h2>
              <p className="mb-4">
                {language === 'de' && 'Stornierungen müssen mindestens 12 Stunden vor der geplanten Abholzeit erfolgen. Spätere Stornierungen können Gebühren verursachen.'}
                {language === 'en' && 'Cancellations must be made at least 12 hours before the scheduled pickup time. Later cancellations may incur fees.'}
                {language === 'tr' && 'İptaller planlanan alma zamanından en az 12 saat önce yapılmalıdır. Daha geç iptaller ücretlendirilebilir.'}
                {language === 'ru' && 'Отмены должны быть сделаны не менее чем за 12 часов до запланированного времени встречи. Более поздние отмены могут повлечь за собой сборы.'}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#0F1E3C]">
                {language === 'de' ? '§5 Haftung' : '§5 Liability'}
              </h2>
              <p className="mb-4">
                {language === 'de' && 'Unsere Haftung ist auf den Buchungswert begrenzt. Wir sind nicht haftbar für Verspätungen aufgrund höherer Gewalt.'}
                {language === 'en' && 'Our liability is limited to the booking value. We are not liable for delays due to force majeure.'}
                {language === 'tr' && 'Sorumluluğumuz rezervasyon değeri ile sınırlıdır. Mücbir sebeplerden kaynaklanan gecikmelerden sorumlu değiliz.'}
                {language === 'ru' && 'Наша ответственность ограничена стоимостью бронирования. Мы не несем ответственности за задержки из-за форс-мажорных обстоятельств.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 