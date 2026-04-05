export type VehicleType = "vip-6" | "vip-10" | "vip-16";

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

export type ReservationStatus = "pending" | "confirmed" | "canceled";

export interface Reservation {
  id: string;
  code?: string;
  createdAt: number;
  updatedAt?: number;

  status: ReservationStatus;

  from: string;
  to: string;
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
  cancel?: {
    requested: boolean;
    reason: string | null;
    requestedAt: number | null;
    canceledAt: number | null;
  } | null;
  vehicleType?: VehicleType;
  vehicleId?: string;
  plate?: string;
  driverName?: string;
  driverPhone?: string;
}
