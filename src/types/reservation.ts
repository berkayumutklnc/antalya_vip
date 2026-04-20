export type Lang = "de" | "en" | "tr" | "ru";
export type VehicleType = "vip-6" | "vip-10" |  "vip-16";

export interface ReservationFormData {
  lang: Lang;

  from: string;
  to: string;
  date: string;
  time: string;

  adults: number;
  babySeat: number;

  fullName: string;
  phone: string;
  email: string;

  flightNo?: string | null;
  terminal?: string | null;
  baggageCount?: number | null;

  vehicleType?: VehicleType;
  serviceTypeId?: string;
  serviceVariantKey?: string;
  price: number;

  note?: string | null;
  acceptPolicy?: boolean | null;
  acceptKvkk?: boolean | null;
  acceptComms?: boolean | null;
}

export type ReservationStatus = "pending" | "confirmed" | "completed" | "no_show" | "canceled";

export interface ReservationRecord extends ReservationFormData {
  id?: string;
  code?: string;
  status?: ReservationStatus;
  createdAt?: number;
  updatedAt?: number;
}

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
  },
  {
    id: "vip-10",
    title: "VIP Minibus (10 Koltuk)",
    seats: 10,
    bags: 8,
    image: "/vehicles/vip-10.jpg",
    features: ["Wi-Fi", "USB", "Klima", "Su", "8× Bagaj"],
  },
  {
    id: "vip-16",
    title: "VIP Minibus (16 Koltuk)",
    seats: 16,
    bags: 8,
    image: "/vehicles/vip-16.jpg",
    features: ["Wi-Fi", "USB", "Klima", "Su", "8× Bagaj"],
  },
];
