'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import ReservationForm from '@/components/ReservationForm';

export default function ReservationPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#121212] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#EAEAEA] mb-4">
            {t('reservation', language)}
          </h1>
          <p className="text-xl text-[#B0B0B0]">
            {language === 'de' && 'Buchen Sie Ihren VIP-Transfer in 5 einfachen Schritten'}
            {language === 'en' && 'Book your VIP transfer in 5 simple steps'}
            {language === 'tr' && 'VIP transferinizi 5 basit adımda rezerve edin'}
            {language === 'ru' && 'Забронируйте VIP трансфер в 5 простых шагов'}
          </p>
        </div>

        <ReservationForm />
      </div>
    </div>
  );
} 