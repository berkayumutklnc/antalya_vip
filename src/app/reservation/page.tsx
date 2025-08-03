'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import ReservationForm from '@/components/ReservationForm';

export default function ReservationPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('reservation', language)}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {language === 'de' && 'Buchen Sie Ihren luxuriösen VIP-Transfer in Antalya'}
            {language === 'en' && 'Book your luxury VIP transfer in Antalya'}
            {language === 'tr' && 'Antalya\'da lüks VIP transferinizi rezerve edin'}
            {language === 'ru' && 'Забронируйте роскошный VIP трансфер в Анталье'}
          </p>
        </div>
        
        <ReservationForm />
      </div>
    </div>
  );
} 