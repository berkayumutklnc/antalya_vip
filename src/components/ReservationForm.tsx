'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import { locations } from '@/data/locations';
import { vehicles } from '@/data/vehicles';
import { ReservationFormData } from '@/types';

const reservationSchema = z.object({
  fromLocation: z.string().min(1, 'From location is required'),
  toLocation: z.string().min(1, 'To location is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  adults: z.number().min(1).max(10),
  babySeats: z.number().min(0).max(3),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().min(1, 'Phone is required'),
  customerEmail: z.string().email('Invalid email address')
});

type FormData = z.infer<typeof reservationSchema>;

const ReservationForm: React.FC = () => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(reservationSchema),
    mode: 'onChange'
  });

  const watchedValues = watch();

  const steps = [
    { id: 1, title: t('step1', language) },
    { id: 2, title: t('step2', language) },
    { id: 3, title: t('step3', language) },
    { id: 4, title: t('step4', language) },
    { id: 5, title: t('step5', language) }
  ];

  const timeSlots = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const getLocationName = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return locationId;
    
    switch (language) {
      case 'de': return location.nameDe;
      case 'en': return location.nameEn;
      case 'ru': return location.nameRu;
      default: return location.name;
    }
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return vehicleId;
    
    switch (language) {
      case 'de': return vehicle.nameDe;
      case 'en': return vehicle.nameEn;
      case 'ru': return vehicle.nameRu;
      default: return vehicle.name;
    }
  };

  const getVehicleFeatures = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return [];
    
    switch (language) {
      case 'de': return vehicle.featuresDe;
      case 'en': return vehicle.featuresEn;
      case 'ru': return vehicle.featuresRu;
      default: return vehicle.features;
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    // TODO: Submit to Firebase
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#1F2937] mb-2">
          {t('from', language)}
        </label>
        <Controller
          name="fromLocation"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="w-full px-3 py-2 border border-[#0F1E3C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-[#1F2937]"
            >
              <option value="">{language === 'de' ? 'Bitte wählen' : 'Please select'}</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {getLocationName(location.id)}
                </option>
              ))}
            </select>
          )}
        />
        {errors.fromLocation && (
          <p className="text-[#DC2626] text-sm mt-1">{errors.fromLocation.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1F2937] mb-2">
          {t('to', language)}
        </label>
        <Controller
          name="toLocation"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="w-full px-3 py-2 border border-[#0F1E3C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-[#1F2937]"
            >
              <option value="">{language === 'de' ? 'Bitte wählen' : 'Please select'}</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {getLocationName(location.id)}
                </option>
              ))}
            </select>
          )}
        />
        {errors.toLocation && (
          <p className="text-[#DC2626] text-sm mt-1">{errors.toLocation.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-2">
            {t('date', language)}
          </label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                {...field}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-[#0F1E3C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-[#1F2937]"
              />
            )}
          />
          {errors.date && (
            <p className="text-[#DC2626] text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-2">
            {t('time', language)}
          </label>
          <Controller
            name="time"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-[#0F1E3C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-[#1F2937]"
              >
                <option value="">{language === 'de' ? 'Bitte wählen' : 'Please select'}</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            )}
          />
          {errors.time && (
            <p className="text-[#DC2626] text-sm mt-1">{errors.time.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#1F2937] mb-2">
          {t('adults', language)}
        </label>
        <Controller
          name="adults"
          control={control}
          render={({ field }) => (
            <input
              type="number"
              {...field}
              min="1"
              max="10"
              onChange={(e) => field.onChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-[#0F1E3C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-[#1F2937]"
            />
          )}
        />
        {errors.adults && (
          <p className="text-[#DC2626] text-sm mt-1">{errors.adults.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1F2937] mb-2">
          {t('babySeats', language)}
        </label>
        <Controller
          name="babySeats"
          control={control}
          render={({ field }) => (
            <input
              type="number"
              {...field}
              min="0"
              max="3"
              onChange={(e) => field.onChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-[#0F1E3C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-[#1F2937]"
            />
          )}
        />
        {errors.babySeats && (
          <p className="text-[#DC2626] text-sm mt-1">{errors.babySeats.message}</p>
        )}
        <p className="text-sm text-[#1F2937] mt-1">
          {language === 'de' ? '1 Kindersitz ist kostenlos, weitere kosten extra' : '1 baby seat is free, additional ones cost extra'}
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map(vehicle => (
          <div
            key={vehicle.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              watchedValues.vehicleId === vehicle.id
                ? 'border-[#FFD700] bg-[#FFD700]/10'
                : 'border-[#0F1E3C] hover:border-[#FFD700]'
            }`}
            onClick={() => setValue('vehicleId', vehicle.id)}
          >
            <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-500">Vehicle Image</span>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-[#1F2937]">
              {getVehicleName(vehicle.id)}
            </h3>
            <p className="text-sm text-[#1F2937] mb-3">
              {t('capacity', language)}: {vehicle.capacity} {language === 'de' ? 'Personen' : 'people'}
            </p>
            <div className="space-y-1">
              {getVehicleFeatures(vehicle.id).map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-[#1F2937]">
                  <svg className="w-4 h-4 text-[#10B981] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {errors.vehicleId && (
        <p className="text-[#DC2626] text-sm">{errors.vehicleId.message}</p>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#1F2937] mb-2">
          {t('customerName', language)}
        </label>
        <Controller
          name="customerName"
          control={control}
          render={({ field }) => (
            <input
              type="text"
              {...field}
              className="w-full px-3 py-2 border border-[#0F1E3C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-[#1F2937]"
            />
          )}
        />
        {errors.customerName && (
          <p className="text-[#DC2626] text-sm mt-1">{errors.customerName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1F2937] mb-2">
          {t('customerPhone', language)}
        </label>
        <Controller
          name="customerPhone"
          control={control}
          render={({ field }) => (
            <input
              type="tel"
              {...field}
              className="w-full px-3 py-2 border border-[#0F1E3C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-[#1F2937]"
            />
          )}
        />
        {errors.customerPhone && (
          <p className="text-[#DC2626] text-sm mt-1">{errors.customerPhone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1F2937] mb-2">
          {t('customerEmail', language)}
        </label>
        <Controller
          name="customerEmail"
          control={control}
          render={({ field }) => (
            <input
              type="email"
              {...field}
              className="w-full px-3 py-2 border border-[#0F1E3C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] text-[#1F2937]"
            />
          )}
        />
        {errors.customerEmail && (
          <p className="text-[#DC2626] text-sm mt-1">{errors.customerEmail.message}</p>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="bg-[#F9F9F9] rounded-lg p-6 border border-[#0F1E3C]/20">
        <h3 className="font-semibold text-lg mb-4 text-[#1F2937]">
          {language === 'de' ? 'Reservierungsübersicht' : 'Reservation Summary'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#1F2937]">
              {t('from', language)}: <span className="font-medium">{getLocationName(watchedValues.fromLocation || '')}</span>
            </p>
            <p className="text-sm text-[#1F2937]">
              {t('to', language)}: <span className="font-medium">{getLocationName(watchedValues.toLocation || '')}</span>
            </p>
            <p className="text-sm text-[#1F2937]">
              {t('date', language)}: <span className="font-medium">{watchedValues.date}</span>
            </p>
            <p className="text-sm text-[#1F2937]">
              {t('time', language)}: <span className="font-medium">{watchedValues.time}</span>
            </p>
          </div>
          
          <div>
            <p className="text-sm text-[#1F2937]">
              {t('adults', language)}: <span className="font-medium">{watchedValues.adults}</span>
            </p>
            <p className="text-sm text-[#1F2937]">
              {t('babySeats', language)}: <span className="font-medium">{watchedValues.babySeats}</span>
            </p>
            <p className="text-sm text-[#1F2937]">
              {t('vehicle', language)}: <span className="font-medium">{getVehicleName(watchedValues.vehicleId || '')}</span>
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[#0F1E3C]/20">
          <p className="text-sm text-[#1F2937]">
            {t('customerName', language)}: <span className="font-medium">{watchedValues.customerName}</span>
          </p>
          <p className="text-sm text-[#1F2937]">
            {t('customerPhone', language)}: <span className="font-medium">{watchedValues.customerPhone}</span>
          </p>
          <p className="text-sm text-[#1F2937]">
            {t('customerEmail', language)}: <span className="font-medium">{watchedValues.customerEmail}</span>
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= step.id ? 'bg-[#0F1E3C] text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step.id}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step.id ? 'text-[#0F1E3C]' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-[#0F1E3C]' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg shadow-md border border-[#0F1E3C]/20 p-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-[#0F1E3C] rounded-md text-[#0F1E3C] hover:bg-[#0F1E3C] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('previous', language)}
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-[#FFD700] text-[#0F1E3C] rounded-md hover:bg-[#F5C542] transition-colors font-semibold"
            >
              {t('next', language)}
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isValid}
              className="px-6 py-2 bg-[#10B981] text-white rounded-md hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {t('confirm', language)}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReservationForm; 