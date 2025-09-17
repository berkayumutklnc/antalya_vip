export type VehicleType = "vip-6" | "vip-10" | "vip-16";

export interface BlockedSlot {
  startAt: number;   // UTC ms
  endAt: number;     // UTC ms
  reason: "confirmed-reservation" | "manual-block";
  reservationId?: string;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  plate?: string;
  driverName?: string;
  driverPhone?: string;
  blockedSlots: BlockedSlot[];
  createdAt: number;
  updatedAt: number;
}

export type ReservationStatus = "pending" | "confirmed" | "canceled";

export interface Reservation {
  id: string;              // TRF-XXXXX
  code?: string;           // istersen kaldır
  createdAt: number;
  updatedAt?: number;

  status: ReservationStatus;

  from: string;
  to: string;
  date: string;            // YYYY-MM-DD
  time: string;            // HH:mm
  startAt: number;         // UTC ms

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
