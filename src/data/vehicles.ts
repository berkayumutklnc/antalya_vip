import { Vehicle } from '@/types';

export const vehicles: Vehicle[] = [
  {
    id: 'mercedes-vito',
    name: 'Mercedes Vito VIP',
    nameDe: 'Mercedes Vito VIP',
    nameEn: 'Mercedes Vito VIP',
    nameRu: 'Mercedes Vito VIP',
    capacity: 8,
    image: '/images/mercedes-vito.jpg',
    features: [
      '8 Kişilik Kapasite',
      'Klima',
      'WiFi',
      'USB Şarj',
      'Bagaj Alanı',
      'Çocuk Koltuğu Uyumlu'
    ],
    featuresDe: [
      '8 Personen Kapazität',
      'Klimaanlage',
      'WiFi',
      'USB-Ladegerät',
      'Gepäckraum',
      'Kindersitz-kompatibel'
    ],
    featuresEn: [
      '8 Person Capacity',
      'Air Conditioning',
      'WiFi',
      'USB Charging',
      'Luggage Space',
      'Child Seat Compatible'
    ],
    featuresRu: [
      'Вместимость 8 человек',
      'Кондиционер',
      'WiFi',
      'USB зарядка',
      'Багажное отделение',
      'Совместимость с детским креслом'
    ],
    blockedSlots: []
  },
  {
    id: 'mercedes-sprinter',
    name: 'Mercedes Sprinter VIP',
    nameDe: 'Mercedes Sprinter VIP',
    nameEn: 'Mercedes Sprinter VIP',
    nameRu: 'Mercedes Sprinter VIP',
    capacity: 16,
    image: '/images/mercedes-sprinter.jpg',
    features: [
      '16 Kişilik Kapasite',
      'Klima',
      'WiFi',
      'USB Şarj',
      'Geniş Bagaj Alanı',
      'Çocuk Koltuğu Uyumlu',
      'Tv Ekranı'
    ],
    featuresDe: [
      '16 Personen Kapazität',
      'Klimaanlage',
      'WiFi',
      'USB-Ladegerät',
      'Großer Gepäckraum',
      'Kindersitz-kompatibel',
      'TV-Bildschirm'
    ],
    featuresEn: [
      '16 Person Capacity',
      'Air Conditioning',
      'WiFi',
      'USB Charging',
      'Large Luggage Space',
      'Child Seat Compatible',
      'TV Screen'
    ],
    featuresRu: [
      'Вместимость 16 человек',
      'Кондиционер',
      'WiFi',
      'USB зарядка',
      'Большое багажное отделение',
      'Совместимость с детским креслом',
      'ТВ экран'
    ],
    blockedSlots: []
  }
]; 