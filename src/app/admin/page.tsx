'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

export default function AdminPage() {
  const { language } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reservations');

  // Mock data for demonstration
  const mockReservations = [
    {
      id: '1',
      reservationNumber: 'TRF-00123',
      fromLocation: 'Antalya Airport',
      toLocation: 'Kemer',
      date: '2024-06-15',
      time: '14:00',
      adults: 4,
      babySeats: 1,
      vehicle: 'Mercedes Vito VIP',
      customerName: 'John Doe',
      customerPhone: '+1234567890',
      customerEmail: 'john@example.com',
      status: 'confirmed',
      createdAt: new Date('2024-05-01')
    },
    {
      id: '2',
      reservationNumber: 'TRF-00124',
      fromLocation: 'Belek',
      toLocation: 'Antalya Airport',
      date: '2024-06-16',
      time: '10:00',
      adults: 2,
      babySeats: 0,
      vehicle: 'Mercedes Sprinter VIP',
      customerName: 'Jane Smith',
      customerPhone: '+0987654321',
      customerEmail: 'jane@example.com',
      status: 'pending',
      createdAt: new Date('2024-05-02')
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement Firebase Auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-[#10B981] bg-[#10B981]/10';
      case 'pending': return 'text-[#F59E0B] bg-[#F59E0B]/10';
      case 'canceled': return 'text-[#DC2626] bg-[#DC2626]/10';
      default: return 'text-[#1F2937] bg-[#1F2937]/10';
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1F2937]">
              {t('admin', language)}
            </h2>
            <p className="mt-2 text-center text-sm text-[#1F2937]">
              {language === 'de' ? 'Anmelden Sie sich in Ihr Admin-Konto' : 'Sign in to your admin account'}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  {language === 'de' ? 'E-Mail-Adresse' : 'Email address'}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#0F1E3C] placeholder-[#1F2937] text-[#1F2937] rounded-t-md focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] focus:z-10 sm:text-sm"
                  placeholder={language === 'de' ? 'E-Mail-Adresse' : 'Email address'}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  {language === 'de' ? 'Passwort' : 'Password'}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#0F1E3C] placeholder-[#1F2937] text-[#1F2937] rounded-b-md focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] focus:z-10 sm:text-sm"
                  placeholder={language === 'de' ? 'Passwort' : 'Password'}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[#0F1E3C] bg-[#FFD700] hover:bg-[#F5C542] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700] disabled:opacity-50 transition-colors"
              >
                {loading ? t('loading', language) : t('login', language)}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-[#0F1E3C]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-[#1F2937]">
              {t('admin', language)} Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-[#1F2937] hover:text-[#0F1E3C] transition-colors"
            >
              {t('logout', language)}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-[#0F1E3C]/20 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reservations'
                  ? 'border-[#FFD700] text-[#0F1E3C]'
                  : 'border-transparent text-[#1F2937] hover:text-[#0F1E3C] hover:border-[#0F1E3C]/30'
              }`}
            >
              {t('allReservations', language)}
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'calendar'
                  ? 'border-[#FFD700] text-[#0F1E3C]'
                  : 'border-transparent text-[#1F2937] hover:text-[#0F1E3C] hover:border-[#0F1E3C]/30'
              }`}
            >
              {t('calendar', language)}
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'reservations' && (
          <div className="bg-white shadow-md rounded-lg border border-[#0F1E3C]/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-[#1F2937] mb-4">
                {t('allReservations', language)}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#0F1E3C]/20">
                  <thead className="bg-[#F9F9F9]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2937] uppercase tracking-wider">
                        {t('reservationNumber', language)}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2937] uppercase tracking-wider">
                        {t('customerName', language)}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2937] uppercase tracking-wider">
                        {t('from', language)} - {t('to', language)}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2937] uppercase tracking-wider">
                        {t('date', language)} / {t('time', language)}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2937] uppercase tracking-wider">
                        {t('vehicle', language)}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2937] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2937] uppercase tracking-wider">
                        {t('edit', language)}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#0F1E3C]/20">
                    {mockReservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1F2937]">
                          {reservation.reservationNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1F2937]">
                          {reservation.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1F2937]">
                          {reservation.fromLocation} → {reservation.toLocation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1F2937]">
                          {reservation.date} {reservation.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1F2937]">
                          {reservation.vehicle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                            {getStatusText(reservation.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-[#FFD700] hover:text-[#F5C542] transition-colors">
                            {t('edit', language)}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white shadow-md rounded-lg border border-[#0F1E3C]/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-[#1F2937] mb-4">
                {t('calendar', language)}
              </h3>
              <div className="h-96 bg-[#F9F9F9] rounded-lg flex items-center justify-center">
                <p className="text-[#1F2937]">
                  {language === 'de' ? 'Kalender wird hier angezeigt' : 'Calendar will be displayed here'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 