'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

export default function TrackPage() {
  const { language } = useLanguage();
  const [reservationNumber, setReservationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [reservation, setReservation] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReservation(null);

    try {
      // TODO: Implement Firebase search
      // For now, simulate a search
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      if (reservationNumber && email) {
        setReservation({
          id: 'mock-123',
          reservationNumber: reservationNumber,
          fromLocation: 'Antalya Airport',
          toLocation: 'Kemer',
          date: '2024-06-15',
          time: '14:00',
          adults: 4,
          babySeats: 1,
          vehicle: 'Mercedes Vito VIP',
          customerName: 'John Doe',
          customerPhone: '+1234567890',
          customerEmail: email,
          status: 'confirmed',
          createdAt: new Date('2024-05-01')
        });
      } else {
        setError(language === 'de' ? 'Reservierung nicht gefunden' : 'Reservation not found');
      }
    } catch (err) {
      setError(language === 'de' ? 'Ein Fehler ist aufgetreten' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-[#10B981] bg-[#10B981]/10';
      case 'pending': return 'text-[#F59E0B] bg-[#F59E0B]/10';
      case 'canceled': return 'text-[#DC2626] bg-[#DC2626]/10';
      default: return 'text-[#EAEAEA] bg-[#EAEAEA]/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return t('status.confirmed', language);
      case 'pending': return t('status.pending', language);
      case 'canceled': return t('status.canceled', language);
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#EAEAEA] mb-4">
            {t('trackReservation', language)}
          </h1>
          <p className="text-xl text-[#B0B0B0]">
            {language === 'de' && 'Verfolgen Sie den Status Ihrer Reservierung'}
            {language === 'en' && 'Track the status of your reservation'}
            {language === 'tr' && 'Rezervasyonunuzun durumunu takip edin'}
            {language === 'ru' && 'Отследите статус вашей брони'}
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-[#1E1E2F] rounded-2xl shadow-lg border border-[#2A2A3C] p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
                  {t('reservationNumber', language)}
                </label>
                <input
                  type="text"
                  value={reservationNumber}
                  onChange={(e) => setReservationNumber(e.target.value)}
                  placeholder={language === 'de' ? 'TRF-XXXXX' : 'TRF-XXXXX'}
                  className="w-full px-3 py-2 border border-[#2A2A3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A756] focus:border-[#D6A756] text-[#EAEAEA] bg-[#121212] placeholder-[#9A9A9A]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
                  {t('customerEmail', language)}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === 'de' ? 'ihre@email.de' : 'your@email.com'}
                  className="w-full px-3 py-2 border border-[#2A2A3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A756] focus:border-[#D6A756] text-[#EAEAEA] bg-[#121212] placeholder-[#9A9A9A]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-[#D6A756] text-[#121212] rounded-lg hover:bg-[#c09445] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? t('loading', language) : t('trackButton', language)}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-2xl p-4 mb-8">
            <p className="text-[#DC2626]">{error}</p>
          </div>
        )}

        {/* Reservation Details */}
        {reservation && (
          <div className="bg-[#1E1E2F] rounded-2xl shadow-lg border border-[#2A2A3C] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#EAEAEA]">
                {language === 'de' ? 'Reservierungsdetails' : 'Reservation Details'}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                {getStatusText(reservation.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-[#B0B0B0]">
                    {t('reservationNumber', language)}
                  </h3>
                  <p className="text-lg font-semibold text-[#EAEAEA]">{reservation.reservationNumber}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#B0B0B0]">
                    {t('from', language)}
                  </h3>
                  <p className="text-lg text-[#EAEAEA]">{reservation.fromLocation}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#B0B0B0]">
                    {t('to', language)}
                  </h3>
                  <p className="text-lg text-[#EAEAEA]">{reservation.toLocation}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#B0B0B0]">
                    {t('date', language)}
                  </h3>
                  <p className="text-lg text-[#EAEAEA]">{reservation.date}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#B0B0B0]">
                    {t('time', language)}
                  </h3>
                  <p className="text-lg text-[#EAEAEA]">{reservation.time}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-[#B0B0B0]">
                    {t('adults', language)}
                  </h3>
                  <p className="text-lg text-[#EAEAEA]">{reservation.adults}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#B0B0B0]">
                    {t('babySeats', language)}
                  </h3>
                  <p className="text-lg text-[#EAEAEA]">{reservation.babySeats}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#B0B0B0]">
                    {t('vehicle', language)}
                  </h3>
                  <p className="text-lg text-[#EAEAEA]">{reservation.vehicle}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#B0B0B0]">
                    {t('customerName', language)}
                  </h3>
                  <p className="text-lg text-[#EAEAEA]">{reservation.customerName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#B0B0B0]">
                    {t('customerPhone', language)}
                  </h3>
                  <p className="text-lg text-[#EAEAEA]">{reservation.customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            {reservation.status === 'confirmed' && (
              <div className="mt-8 pt-6 border-t border-[#2A2A3C]">
                <button
                  className="px-6 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors"
                  onClick={() => {
                    // TODO: Implement cancel functionality
                    alert(language === 'de' ? 'Stornierungsanfrage gesendet' : 'Cancel request sent');
                  }}
                >
                  {language === 'de' ? 'Reservierung stornieren' : 'Cancel Reservation'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 