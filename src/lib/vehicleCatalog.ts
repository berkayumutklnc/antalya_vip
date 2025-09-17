import type { VehicleType } from "@/types";

export type FeatureKey = "wifi" | "usb" | "ac" | "water" | "luggage";
export type VehicleCatalogItem = {
  title: string;
  capacity: number;
  image: string; // public/ altında dosya yolu
  features: FeatureKey[];
};

export const VEHICLE_CATALOG: Record<VehicleType, VehicleCatalogItem> = {
  "vip-6": {
    title: "VIP Minivan",
    capacity: 6,
    image: "/vehicles/vip-6.jpg",
    features: ["wifi", "usb", "ac", "water", "luggage"],
  },
  "vip-10": {
    title: "VIP Minibus",
    capacity: 10,
    image: "/vehicles/vip-10.jpg",
    features: ["wifi", "usb", "ac", "water", "luggage"],
  },
  "vip-16": {
    title: "VIP Minibus",
    capacity: 16,
    image: "/vehicles/vip-16.jpg",
    features: ["wifi", "usb", "ac", "water", "luggage"],
  },
};
