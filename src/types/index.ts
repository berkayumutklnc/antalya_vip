export interface Location {
  id: string;
  name: string;
  nameDe: string;
  nameEn: string;
  nameRu: string;
}

export interface Vehicle {
  id: string;
  name: string;
  nameDe: string;
  nameEn: string;
  nameRu: string;
  capacity: number;
  image: string;
  features: string[];
  featuresDe: string[];
  featuresEn: string[];
  featuresRu: string[];
  blockedSlots: string[]; // ISO date strings
}

export interface Reservation {
  id: string;
  reservationNumber: string; // TRF-XXXXX format
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  adults: number;
  babySeats: number;
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: Date;
  updatedAt: Date;
  cancelReason?: string;
}

export interface ReservationFormData {
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  adults: number;
  babySeats: number;
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export type Language = 'tr' | 'de' | 'en' | 'ru'; 