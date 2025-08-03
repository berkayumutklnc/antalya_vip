'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

export default function AdminPage() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reservations, setReservations] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  // Mock login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implement Firebase Auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@antalya-vip.com' && password === 'admin123') {
        setIsLoggedIn(true);
        loadReservations();
      } else {
        setError(language === 'de' ? 'Ungültige Anmeldedaten' : 'Invalid credentials');
      }
    } catch (err) {
      setError(language === 'de' ? 'Ein Fehler ist aufgetreten' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    // TODO: Implement Firebase fetch
    // Mock data
    setReservations([
      {
        id: '1',
        reservationNumber: 'TRF-001',
        fromLocation: 'Antalya Airport',
        toLocation: 'Kemer',
        date: '2025-08-03',
        time: '14:00',
        adults: 4,
        babySeats: 1,
        vehicle: 'Mercedes Vito VIP',
        customerName: 'Berkay KILINÇ',
        customerEmail: 'berkay@gmail.com',
        customerPhone: '+1234567890',
        status: 'confirmed',
        createdAt: new Date('2025-08-03')
      },
      {
        id: '2',
        reservationNumber: 'TRF-002',
        fromLocation: 'Kemer',
        toLocation: 'Antalya Airport',
        date: '2025-08-13',
        time: '10:00',
        adults: 2,
        babySeats: 0,
        vehicle: 'Mercedes Vito VIP',
        customerName: 'Berkay KILINÇ',
        customerEmail: 'berkay@gmail.com',
        customerPhone: '+0987654321',
        status: 'pending',
        createdAt: new Date('2025-08-03')
      }
    ]);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    // TODO: Implement Firebase update
    setReservations(prev => 
      prev.map(res => 
        res.id === id ? { ...res, status: newStatus } : res
      )
    );
  };

  const filteredReservations = reservations.filter(res => {
    if (filter === 'all') return true;
    return res.status === filter;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return language === 'de' ? 'Ausstehend' : 
               language === 'en' ? 'Pending' : 
               language === 'tr' ? 'Beklemede' : 
               language === 'ru' ? 'В ожидании' : 'Pending';
      case 'confirmed':
        return language === 'de' ? 'Bestätigt' : 
               language === 'en' ? 'Confirmed' : 
               language === 'tr' ? 'Onaylandı' : 
               language === 'ru' ? 'Подтверждено' : 'Confirmed';
      case 'canceled':
        return language === 'de' ? 'Storniert' : 
               language === 'en' ? 'Canceled' : 
               language === 'tr' ? 'İptal Edildi' : 
               language === 'ru' ? 'Отменено' : 'Canceled';
      default:
        return status;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center py-12">
        <div className="max-w-md w-full">
          <div className="bg-[#1E1E2F] rounded-2xl shadow-lg border border-[#2A2A3C] p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#EAEAEA] mb-2">
                {language === 'de' ? 'Admin Login' : 'Admin Login'}
              </h1>
              <p className="text-[#B0B0B0]">
                {language === 'de' ? 'Melden Sie sich an, um Reservierungen zu verwalten' : 'Sign in to manage reservations'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
                  {language === 'de' ? 'E-Mail' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#2A2A3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A756] focus:border-[#D6A756] text-[#EAEAEA] bg-[#121212] placeholder-[#9A9A9A]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
                  {language === 'de' ? 'Passwort' : 'Password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#2A2A3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A756] focus:border-[#D6A756] text-[#EAEAEA] bg-[#121212] placeholder-[#9A9A9A]"
                  required
                />
              </div>

              {error && (
                <div className="bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-lg p-3">
                  <p className="text-[#DC2626] text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#D6A756] text-[#121212] rounded-lg hover:bg-[#c09445] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? t('loading', language) : (language === 'de' ? 'Anmelden' : 'Sign In')}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#B0B0B0]">
              <p>Demo: admin@antalya-vip.com / admin123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA] mb-2">
              {language === 'de' ? 'Admin Dashboard' : 'Admin Dashboard'}
            </h1>
            <p className="text-[#B0B0B0]">
              {language === 'de' ? 'Verwalten Sie alle Reservierungen' : 'Manage all reservations'}
            </p>
          </div>
          
          <button
            onClick={() => setIsLoggedIn(false)}
            className="px-4 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors"
          >
            {language === 'de' ? 'Abmelden' : 'Logout'}
          </button>
        </div>

        {/* Filter */}
        <div className="bg-[#1E1E2F] rounded-2xl shadow-lg border border-[#2A2A3C] p-6 mb-8">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-[#EAEAEA]">
              {language === 'de' ? 'Filter:' : 'Filter:'}
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-[#2A2A3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A756] focus:border-[#D6A756] text-[#EAEAEA] bg-[#121212]"
            >
              <option value="all">
                {language === 'de' ? 'Alle' : 
                 language === 'en' ? 'All' : 
                 language === 'tr' ? 'Tümü' : 
                 language === 'ru' ? 'Все' : 'All'}
              </option>
              <option value="pending">
                {language === 'de' ? 'Ausstehend' : 
                 language === 'en' ? 'Pending' : 
                 language === 'tr' ? 'Beklemede' : 
                 language === 'ru' ? 'В ожидании' : 'Pending'}
              </option>
              <option value="confirmed">
                {language === 'de' ? 'Bestätigt' : 
                 language === 'en' ? 'Confirmed' : 
                 language === 'tr' ? 'Onaylandı' : 
                 language === 'ru' ? 'Подтверждено' : 'Confirmed'}
              </option>
              <option value="canceled">
                {language === 'de' ? 'Storniert' : 
                 language === 'en' ? 'Canceled' : 
                 language === 'tr' ? 'İptal Edildi' : 
                 language === 'ru' ? 'Отменено' : 'Canceled'}
              </option>
            </select>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-6">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className="bg-[#1E1E2F] rounded-2xl shadow-lg border border-[#2A2A3C] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#EAEAEA]">
                    {reservation.reservationNumber}
                  </h3>
                  <p className="text-[#B0B0B0]">{reservation.customerName}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={reservation.status}
                    onChange={(e) => updateStatus(reservation.id, e.target.value)}
                    className="px-3 py-1 border border-[#2A2A3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A756] focus:border-[#D6A756] text-[#EAEAEA] bg-[#121212] text-sm"
                  >
                    <option value="pending">
                      {language === 'de' ? 'Ausstehend' : 
                       language === 'en' ? 'Pending' : 
                       language === 'tr' ? 'Beklemede' : 
                       language === 'ru' ? 'В ожидании' : 'Pending'}
                    </option>
                    <option value="confirmed">
                      {language === 'de' ? 'Bestätigt' : 
                       language === 'en' ? 'Confirmed' : 
                       language === 'tr' ? 'Onaylandı' : 
                       language === 'ru' ? 'Подтверждено' : 'Confirmed'}
                    </option>
                    <option value="canceled">
                      {language === 'de' ? 'Storniert' : 
                       language === 'en' ? 'Canceled' : 
                       language === 'tr' ? 'İptal Edildi' : 
                       language === 'ru' ? 'Отменено' : 'Canceled'}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[#B0B0B0]">{t('from', language)}: </span>
                  <span className="text-[#EAEAEA]">{reservation.fromLocation}</span>
                </div>
                <div>
                  <span className="text-[#B0B0B0]">{t('to', language)}: </span>
                  <span className="text-[#EAEAEA]">{reservation.toLocation}</span>
                </div>
                <div>
                  <span className="text-[#B0B0B0]">{t('date', language)}: </span>
                  <span className="text-[#EAEAEA]">{reservation.date}</span>
                </div>
                <div>
                  <span className="text-[#B0B0B0]">{t('time', language)}: </span>
                  <span className="text-[#EAEAEA]">{reservation.time}</span>
                </div>
                <div>
                  <span className="text-[#B0B0B0]">{t('vehicle', language)}: </span>
                  <span className="text-[#EAEAEA]">{reservation.vehicle}</span>
                </div>
                <div>
                  <span className="text-[#B0B0B0]">{t('customerEmail', language)}: </span>
                  <span className="text-[#EAEAEA]">{reservation.customerEmail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#B0B0B0] text-lg">
              {language === 'de' ? 'Keine Reservierungen gefunden' : 'No reservations found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 