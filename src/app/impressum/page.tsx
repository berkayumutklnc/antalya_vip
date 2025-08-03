'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ImpressumPage() {
  const { language } = useLanguage();

  const content = {
    de: {
      title: 'Impressum',
      company: 'Antalya VIP Transfer GmbH',
      address: 'Musterstraße 123, 12345 Musterstadt, Deutschland',
      phone: '+49 123 456 789',
      email: 'info@antalya-vip-transfer.de',
      ceo: 'Max Mustermann',
      register: 'Amtsgericht Musterstadt, HRB 12345',
      vat: 'DE123456789',
      content: 'Max Mustermann'
    },
    en: {
      title: 'Legal Notice',
      company: 'Antalya VIP Transfer GmbH',
      address: 'Sample Street 123, 12345 Sample City, Germany',
      phone: '+49 123 456 789',
      email: 'info@antalya-vip-transfer.de',
      ceo: 'Max Mustermann',
      register: 'District Court Sample City, HRB 12345',
      vat: 'DE123456789',
      content: 'Max Mustermann'
    },
    tr: {
      title: 'Yasal Uyarı',
      company: 'Antalya VIP Transfer GmbH',
      address: 'Örnek Sokak 123, 12345 Örnek Şehir, Almanya',
      phone: '+49 123 456 789',
      email: 'info@antalya-vip-transfer.de',
      ceo: 'Max Mustermann',
      register: 'Örnek Şehir Bölge Mahkemesi, HRB 12345',
      vat: 'DE123456789',
      content: 'Max Mustermann'
    },
    ru: {
      title: 'Правовая информация',
      company: 'Antalya VIP Transfer GmbH',
      address: 'Образцовая улица 123, 12345 Образцовый город, Германия',
      phone: '+49 123 456 789',
      email: 'info@antalya-vip-transfer.de',
      ceo: 'Max Mustermann',
      register: 'Окружной суд Образцового города, HRB 12345',
      vat: 'DE123456789',
      content: 'Max Mustermann'
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md border border-[#0F1E3C]/20 p-8">
          <h1 className="text-3xl font-bold text-[#1F2937] mb-8">
            {currentContent.title}
          </h1>
          
          <div className="space-y-6 text-[#1F2937]">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-[#0F1E3C]">
                {language === 'de' ? 'Angaben gemäß § 5 TMG' : 'Information according to § 5 TMG'}
              </h2>
              <p className="mb-2"><strong>{currentContent.company}</strong></p>
              <p className="mb-2">{currentContent.address}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 text-[#0F1E3C]">
                {language === 'de' ? 'Kontakt' : 'Contact'}
              </h2>
              <p className="mb-2">
                {language === 'de' ? 'Telefon' : 'Phone'}: {currentContent.phone}
              </p>
              <p className="mb-2">
                E-Mail: {currentContent.email}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 text-[#0F1E3C]">
                {language === 'de' ? 'Vertretungsberechtigte Person' : 'Representative'}
              </h2>
              <p>{currentContent.ceo}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 text-[#0F1E3C]">
                {language === 'de' ? 'Registereintrag' : 'Register Entry'}
              </h2>
              <p>{currentContent.register}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 text-[#0F1E3C]">
                {language === 'de' ? 'Umsatzsteuer-ID' : 'VAT ID'}
              </h2>
              <p>{currentContent.vat}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 text-[#0F1E3C]">
                {language === 'de' ? 'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV' : 'Responsible for content according to § 55 Abs. 2 RStV'}
              </h2>
              <p>{currentContent.content}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 