'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

export default function Home() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#1E1E2F] to-[#2A2A3C] text-[#EAEAEA]">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('heroTitle', language)}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-[#B0B0B0]">
              {t('heroSubtitle', language)}
            </p>
            <Link
              href="/reservation"
              className="inline-block bg-[#D6A756] text-[#121212] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#c09445] transition-colors shadow-lg"
            >
              {t('heroButton', language)}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#EAEAEA] mb-4">
              {language === 'de' && 'Warum uns wählen?'}
              {language === 'en' && 'Why Choose Us?'}
              {language === 'tr' && 'Neden Bizi Seçmelisiniz?'}
              {language === 'ru' && 'Почему выбирают нас?'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-[#1E1E2F] p-6 rounded-2xl shadow-lg border border-[#2A2A3C]">
              <div className="bg-[#D6A756] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#121212]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#EAEAEA]">
                {language === 'de' && 'Pünktlichkeit'}
                {language === 'en' && 'Punctuality'}
                {language === 'tr' && 'Zamanında Hizmet'}
                {language === 'ru' && 'Пунктуальность'}
              </h3>
              <p className="text-[#B0B0B0]">
                {language === 'de' && 'Wir sind immer pünktlich und zuverlässig'}
                {language === 'en' && 'We are always punctual and reliable'}
                {language === 'tr' && 'Her zaman zamanında ve güveniliriz'}
                {language === 'ru' && 'Мы всегда пунктуальны и надежны'}
              </p>
            </div>
            
            <div className="text-center bg-[#1E1E2F] p-6 rounded-2xl shadow-lg border border-[#2A2A3C]">
              <div className="bg-[#D6A756] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#121212]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#EAEAEA]">
                {language === 'de' && 'Qualität'}
                {language === 'en' && 'Quality'}
                {language === 'tr' && 'Kalite'}
                {language === 'ru' && 'Качество'}
              </h3>
              <p className="text-[#B0B0B0]">
                {language === 'de' && 'Luxuriöse Fahrzeuge und professioneller Service'}
                {language === 'en' && 'Luxury vehicles and professional service'}
                {language === 'tr' && 'Lüks araçlar ve profesyonel hizmet'}
                {language === 'ru' && 'Роскошные автомобили и профессиональный сервис'}
              </p>
            </div>
            
            <div className="text-center bg-[#1E1E2F] p-6 rounded-2xl shadow-lg border border-[#2A2A3C]">
              <div className="bg-[#D6A756] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#121212]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#EAEAEA]">
                {language === 'de' && 'Erfahrung'}
                {language === 'en' && 'Experience'}
                {language === 'tr' && 'Deneyim'}
                {language === 'ru' && 'Опыт'}
              </h3>
              <p className="text-[#B0B0B0]">
                {language === 'de' && 'Jahrelange Erfahrung im Transfer-Service'}
                {language === 'en' && 'Years of experience in transfer service'}
                {language === 'tr' && 'Transfer hizmetinde yılların deneyimi'}
                {language === 'ru' && 'Многолетний опыт в трансферном сервисе'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#1E1E2F] text-[#EAEAEA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === 'de' && 'Bereit für Ihre Reise?'}
            {language === 'en' && 'Ready for Your Journey?'}
            {language === 'tr' && 'Yolculuğunuza Hazır mısınız?'}
            {language === 'ru' && 'Готовы к путешествию?'}
          </h2>
          <p className="text-xl mb-8 text-[#B0B0B0]">
            {language === 'de' && 'Buchen Sie jetzt Ihren VIP-Transfer'}
            {language === 'en' && 'Book your VIP transfer now'}
            {language === 'tr' && 'VIP transferinizi şimdi rezerve edin'}
            {language === 'ru' && 'Забронируйте VIP трансфер сейчас'}
          </p>
          <Link
            href="/reservation"
            className="inline-block bg-[#D6A756] text-[#121212] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#c09445] transition-colors shadow-lg"
          >
            {t('heroButton', language)}
          </Link>
        </div>
      </section>
    </div>
  );
}
