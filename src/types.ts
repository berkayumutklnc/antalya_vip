export type VehicleType = "vip-6" | "vip-10" | "vip-16";

export interface ServiceType {
  id: string;
  slug: string;
  nameDe: string;
  nameEn: string;
  nameTr: string;
  nameRu: string;
  capacity: number;
  image: string;
  features: string[];
  sortOrder: number;
  isActive: boolean;
  isBookable: boolean;
}

export interface ServiceVariant {
  id: string;
  serviceTypeId: string;
  key: string;
  nameDe: string;
  nameEn: string;
  nameTr: string;
  nameRu: string;
  priceModifierEur: number;
  sortOrder: number;
  isActive: boolean;
}

export interface BlockedSlot {
  startAt: number;
  endAt: number;
  reason: "admin-assign" | "manual" | "confirmed-reservation" | "manual-block";
  reservationId?: string;
  driverName?: string | null;
  driverPhone?: string | null;
  plate?: string | null;
  type?: VehicleType | null;
  updatedAt?: number;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  plate?: string;
  driverName?: string;
  driverPhone?: string;
  capacity?: number | null;
  blockedSlots: BlockedSlot[];
  createdAt: number;
  updatedAt: number;
}

export type ReservationStatus = "pending" | "confirmed" | "completed" | "no_show" | "canceled";

export interface Reservation {
  id: string;
  code?: string;
  createdAt: number;
  updatedAt?: number;

  status: ReservationStatus;

  from: string;
  to: string;
  fromKey?: string | null;
  toKey?: string | null;
  date: string;
  time: string;
  startAt: number;

  lang: "de" | "en" | "tr" | "ru";
  adults: number;
  babySeat: number;

  fullName: string;
  phone: string;
  email: string;

  price?: number | null;
  quotedBasePrice?: number | null;
  variantSurcharge?: number | null;
  quotedTotalPrice?: number | null;
  currency?: string | null;
  cancel?: {
    requested: boolean;
    reason: string | null;
    requestedAt: number | null;
    canceledAt: number | null;
  } | null;
  vehicleType?: VehicleType;
  serviceTypeId?: string | null;
  serviceVariantKey?: string | null;
  vehicleId?: string;
  plate?: string;
  driverName?: string;
  driverPhone?: string;
}
