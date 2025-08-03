'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DatenschutzPage() {
  const { language } = useLanguage();

  const content = {
    de: {
      title: 'Datenschutzerklärung',
      lastUpdated: 'Zuletzt aktualisiert: 3. August 2025'
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: August 3, 2025'
    },
    tr: {
      title: 'Gizlilik Politikası',
      lastUpdated: 'Son güncelleme: 3 Ağustos 2025'
    },
    ru: {
      title: 'Политика конфиденциальности',
      lastUpdated: 'Последнее обновление: 3 августа 2025'
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
                {language === 'de' ? '1. Datenschutz auf einen Blick' : '1. Privacy at a Glance'}
              </h2>
              <p className="mb-4">
                {language === 'de' && 'Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung personenbezogener Daten auf unserer Website.'}
                {language === 'en' && 'This privacy policy informs you about the nature, scope and purpose of the processing of personal data on our website.'}
                {language === 'tr' && 'Bu gizlilik politikası, web sitemizdeki kişisel verilerin işlenmesinin doğası, kapsamı ve amacı hakkında sizi bilgilendirir.'}
                {language === 'ru' && 'Эта политика конфиденциальности информирует вас о характере, объеме и цели обработки персональных данных на нашем веб-сайте.'}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#0F1E3C]">
                {language === 'de' ? '2. Verantwortliche Stelle' : '2. Responsible Party'}
              </h2>
              <p className="mb-4">
                {language === 'de' && 'Antalya VIP Transfer GmbH, Musterstraße 123, 12345 Musterstadt, Deutschland'}
                {language === 'en' && 'Antalya VIP Transfer GmbH, Sample Street 123, 12345 Sample City, Germany'}
                {language === 'tr' && 'Antalya VIP Transfer GmbH, Örnek Sokak 123, 12345 Örnek Şehir, Almanya'}
                {language === 'ru' && 'Antalya VIP Transfer GmbH, Образцовая улица 123, 12345 Образцовый город, Германия'}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#0F1E3C]">
                {language === 'de' ? '3. Ihre Rechte' : '3. Your Rights'}
              </h2>
              <p className="mb-4">
                {language === 'de' && 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten.'}
                {language === 'en' && 'You have the right to information, correction, deletion and restriction of the processing of your personal data.'}
                {language === 'tr' && 'Kişisel verilerinizin işlenmesi hakkında bilgi alma, düzeltme, silme ve kısıtlama hakkına sahipsiniz.'}
                {language === 'ru' && 'Вы имеете право на информацию, исправление, удаление и ограничение обработки ваших персональных данных.'}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#0F1E3C]">
                {language === 'de' ? '4. Kontakt' : '4. Contact'}
              </h2>
              <p className="mb-4">
                {language === 'de' && 'Bei Fragen zur Verarbeitung Ihrer personenbezogenen Daten können Sie sich an uns wenden: info@antalya-vip-transfer.de'}
                {language === 'en' && 'If you have questions about the processing of your personal data, you can contact us: info@antalya-vip-transfer.de'}
                {language === 'tr' && 'Kişisel verilerinizin işlenmesi hakkında sorularınız varsa bizimle iletişime geçebilirsiniz: info@antalya-vip-transfer.de'}
                {language === 'ru' && 'Если у вас есть вопросы об обработке ваших персональных данных, вы можете связаться с нами: info@antalya-vip-transfer.de'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 