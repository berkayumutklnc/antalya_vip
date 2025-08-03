'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import LanguageSelector from './LanguageSelector';

const Header: React.FC = () => {
  const { language } = useLanguage();

  return (
    <header className="bg-[#0F1E3C] shadow-lg border-b border-[#0F1E3C]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white hover:text-[#FFD700] transition-colors">
              Antalya VIP Transfer
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-white hover:text-[#FFD700] px-3 py-2 text-sm font-medium transition-colors"
            >
              {t('home', language)}
            </Link>
            <Link 
              href="/reservation" 
              className="text-white hover:text-[#FFD700] px-3 py-2 text-sm font-medium transition-colors"
            >
              {t('reservation', language)}
            </Link>
            <Link 
              href="/track" 
              className="text-white hover:text-[#FFD700] px-3 py-2 text-sm font-medium transition-colors"
            >
              {t('trackReservation', language)}
            </Link>
            <Link 
              href="/admin" 
              className="text-white hover:text-[#FFD700] px-3 py-2 text-sm font-medium transition-colors"
            >
              {t('admin', language)}
            </Link>
          </nav>

          {/* Language Selector */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-[#FFD700] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 