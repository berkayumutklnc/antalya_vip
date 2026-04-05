import type { VehicleType } from "@/types/reservation";

export interface RoutePricing {
  [from: string]: {
    [to: string]: {
      [vehicleType in VehicleType]?: number;
    };
  };
}

export const pricingMatrix: RoutePricing = {
  'Antalya Havalimanı (AYT)': {
    'Belek': { 'vip-6': 70, 'vip-10': 120, 'vip-16': 160 },
    'Kemer': { 'vip-6': 80, 'vip-10': 130, 'vip-16': 170 },
    'Lara': { 'vip-6': 45, 'vip-10': 80, 'vip-16': 110 },
    'Side': { 'vip-6': 90, 'vip-10': 150, 'vip-16': 200 },
    'Alanya': { 'vip-6': 120, 'vip-10': 190, 'vip-16': 250 },
    'Kundu': { 'vip-6': 45, 'vip-10': 80, 'vip-16': 110 },
    'Antalya': { 'vip-6': 40, 'vip-10': 70, 'vip-16': 100 },
  },
  'Belek': {
    'Antalya Havalimanı (AYT)': { 'vip-6': 70, 'vip-10': 120, 'vip-16': 160 },
  },
  'Kemer': {
    'Antalya Havalimanı (AYT)': { 'vip-6': 80, 'vip-10': 130, 'vip-16': 170 },
  },
  'Lara': {
    'Antalya Havalimanı (AYT)': { 'vip-6': 45, 'vip-10': 80, 'vip-16': 110 },
  },
  'Side': {
    'Antalya Havalimanı (AYT)': { 'vip-6': 90, 'vip-10': 150, 'vip-16': 200 },
  },
  'Alanya': {
    'Antalya Havalimanı (AYT)': { 'vip-6': 120, 'vip-10': 190, 'vip-16': 250 },
  },
};

export function getPrice(from: string, to: string, vehicleType: VehicleType): number | null {
  return (
    pricingMatrix[from]?.[to]?.[vehicleType] ??
    pricingMatrix[to]?.[from]?.[vehicleType] ??
    null
  );
}
