// src/types/reservation.ts

// --- Basic enums ---
export type Lang = "de" | "en" | "tr" | "ru";
export type VehicleType = "vip-6" | "vip-10" | (string & {});

// --- Form model (UI'de tuttuğumuz state) ---
export interface ReservationFormData {
  // dil
  lang: Lang;

  // rota-zaman
  from: string;
  to: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"

  // yolcu
  adults: number;
  babySeat: number; // 0..n

  // müşteri
  fullName: string;
  phone: string;
  email: string;

  // uçuş/opsiyonel alanlar
  flightNo?: string | null;
  terminal?: string | null;
  baggageCount?: number | null;

  // araç & fiyat
  vehicleType?: VehicleType; // wizard'da seçilene kadar undefined olabilir
  price: number;

  // not & onaylar
  note?: string | null;
  acceptPolicy?: boolean | null;
  acceptKvkk?: boolean | null;
  acceptComms?: boolean | null;
}

// Firestore/Email için genişletilmiş kayıt
export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export interface ReservationRecord extends ReservationFormData {
  id?: string;
  code?: string;
  status?: ReservationStatus;
  createdAt?: number;
  updatedAt?: number;
  // driver vs. eklersen burada genişletebilirsin
}

// --- Araç sabitleri ---
export const VEHICLES: {
  id: VehicleType;
  title: string;
  seats: number;
  bags: number;
  image?: string;
  features?: string[];
  basePriceEur?: number;
}[] = [
  {
    id: "vip-6",
    title: "VIP Minivan (6 Koltuk)",
    seats: 6,
    bags: 4,
    image: "/vehicles/vip-6.jpg",
    features: ["Wi-Fi", "USB", "Klima", "Su", "4× Bagaj"],
    basePriceEur: 65,
  },
  {
    id: "vip-10",
    title: "VIP Minibus (10 Koltuk)",
    seats: 10,
    bags: 8,
    image: "/vehicles/vip-10.jpg",
    features: ["Wi-Fi", "USB", "Klima", "Su", "8× Bagaj"],
    basePriceEur: 90,
  },
];

// --- Helpers ---
export function genPNR() {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `TRF-${n}`;
}

export function calcPrice(vehicle: VehicleType, adults: number, babySeat: number) {
  const base = vehicle === "vip-6" ? 65 : 90; // basit taban fiyat
  const extraBaby = Math.max(0, babySeat - 1) * 5; // 1 bebek koltuğu ücretsiz
  const paxAdj = Math.max(0, adults - 2) * 3; // 2'den sonrası ufak ayar
  return base + extraBaby + paxAdj;
}
