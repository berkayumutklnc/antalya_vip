import type { VehicleType } from "@/types/reservation";

export interface RoutePricing {
  [from: string]: {
    [to: string]: {
      [vehicleType in VehicleType]?: number;
    };
  };
}

/**
 * Pricing matrix keyed by the canonical PLACE_LABELS from config/places.ts.
 * All keys MUST match a value in PLACE_LABELS; mismatches cause null prices.
 */
export const pricingMatrix: RoutePricing = {
  'Antalya Airport (AYT)': {
    'Belek':              { 'vip-6': 70,  'vip-10': 120, 'vip-16': 160 },
    'Kemer':              { 'vip-6': 80,  'vip-10': 130, 'vip-16': 170 },
    'Lara':               { 'vip-6': 45,  'vip-10': 80,  'vip-16': 110 },
    'Side':               { 'vip-6': 90,  'vip-10': 150, 'vip-16': 200 },
    'Alanya':             { 'vip-6': 120, 'vip-10': 190, 'vip-16': 250 },
    'Kundu':              { 'vip-6': 45,  'vip-10': 80,  'vip-16': 110 },
    'Antalya City Center':{ 'vip-6': 40,  'vip-10': 70,  'vip-16': 100 },
  },
  'Belek': {
    'Antalya Airport (AYT)': { 'vip-6': 70, 'vip-10': 120, 'vip-16': 160 },
  },
  'Kemer': {
    'Antalya Airport (AYT)': { 'vip-6': 80, 'vip-10': 130, 'vip-16': 170 },
  },
  'Lara': {
    'Antalya Airport (AYT)': { 'vip-6': 45, 'vip-10': 80, 'vip-16': 110 },
  },
  'Side': {
    'Antalya Airport (AYT)': { 'vip-6': 90, 'vip-10': 150, 'vip-16': 200 },
  },
  'Alanya': {
    'Antalya Airport (AYT)': { 'vip-6': 120, 'vip-10': 190, 'vip-16': 250 },
  },
};

export function getPrice(from: string, to: string, vehicleType: VehicleType): number | null {
  return (
    pricingMatrix[from]?.[to]?.[vehicleType] ??
    pricingMatrix[to]?.[from]?.[vehicleType] ??
    null
  );
}
