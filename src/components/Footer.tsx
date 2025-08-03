'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { language } = useLanguage();

  const footerLinks = {
    tr: {
      impressum: 'Yasal Uyarı',
      datenschutz: 'Gizlilik Politikası',
      agb: 'Kullanım Şartları',
      contact: 'İletişim',
      address: 'Antalya, Türkiye',
      phone: '+49 123 456 789'
    },
    de: {
      impressum: 'Impressum',
      datenschutz: 'Datenschutz',
      agb: 'AGB',
      contact: 'Kontakt',
      address: 'Antalya, Türkei',
      phone: '+49 123 456 789'
    },
    en: {
      impressum: 'Legal Notice',
      datenschutz: 'Privacy Policy',
      agb: 'Terms of Service',
      contact: 'Contact',
      address: 'Antalya, Turkey',
      phone: '+49 123 456 789'
    },
    ru: {
      impressum: 'Правовая информация',
      datenschutz: 'Политика конфиденциальности',
      agb: 'Условия использования',
      contact: 'Контакты',
      address: 'Анталья, Турция',
      phone: '+49 123 456 789'
    }
  };

  const currentLinks = footerLinks[language];

  return (
    <footer className="bg-[#0F1E3C] text-[#F3F4F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-white">Antalya VIP Transfer</h3>
            <p className="text-[#F3F4F6] mb-4">
              {language === 'de' && 'Ihr zuverlässiger Partner für luxuriöse Transfers in Antalya'}
              {language === 'en' && 'Your reliable partner for luxury transfers in Antalya'}
              {language === 'tr' && 'Antalya\'da lüks transfer için güvenilir partneriniz'}
              {language === 'ru' && 'Ваш надежный партнер для роскошных трансферов в Анталье'}
            </p>
            <div className="text-[#F3F4F6]">
              <p>{currentLinks.address}</p>
              <p>{currentLinks.phone}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              {language === 'de' && 'Schnelllinks'}
              {language === 'en' && 'Quick Links'}
              {language === 'tr' && 'Hızlı Bağlantılar'}
              {language === 'ru' && 'Быстрые ссылки'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-[#F3F4F6] hover:text-[#FFD700] transition-colors">
                  {language === 'de' && 'Startseite'}
                  {language === 'en' && 'Home'}
                  {language === 'tr' && 'Ana Sayfa'}
                  {language === 'ru' && 'Главная'}
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="text-[#F3F4F6] hover:text-[#FFD700] transition-colors">
                  {language === 'de' && 'Reservierung'}
                  {language === 'en' && 'Reservation'}
                  {language === 'tr' && 'Rezervasyon'}
                  {language === 'ru' && 'Бронирование'}
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-[#F3F4F6] hover:text-[#FFD700] transition-colors">
                  {language === 'de' && 'Reservierung verfolgen'}
                  {language === 'en' && 'Track Reservation'}
                  {language === 'tr' && 'Rezervasyon Takip'}
                  {language === 'ru' && 'Отследить бронь'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              {language === 'de' && 'Rechtliches'}
              {language === 'en' && 'Legal'}
              {language === 'tr' && 'Yasal'}
              {language === 'ru' && 'Правовая информация'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/impressum" className="text-[#F3F4F6] hover:text-[#FFD700] transition-colors">
                  {currentLinks.impressum}
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-[#F3F4F6] hover:text-[#FFD700] transition-colors">
                  {currentLinks.datenschutz}
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-[#F3F4F6] hover:text-[#FFD700] transition-colors">
                  {currentLinks.agb}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#0F1E3C]/50 mt-8 pt-8 text-center text-[#F3F4F6]">
          <p>&copy; 2024 Antalya VIP Transfer. {language === 'de' && 'Alle Rechte vorbehalten.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 