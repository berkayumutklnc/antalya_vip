import { z } from "zod";
import { PLACE_LABELS } from "@/config/places";

const vehicleTypes = ["vip-6", "vip-10", "vip-16"] as const;
const langs = ["de", "en", "tr", "ru"] as const;

export const CreateReservationSchema = z.object({
  from: z.enum(PLACE_LABELS as unknown as [string, ...string[]]),
  to: z.enum(PLACE_LABELS as unknown as [string, ...string[]]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(5).max(30),
  email: z.string().email().max(120),
  lang: z.enum(langs).optional().default("de"),
  adults: z.number().int().min(1).max(50).optional().default(1),
  babySeat: z.number().int().min(0).max(10).optional().default(0),
  vehicleType: z.enum(vehicleTypes).optional(),
  flightNo: z.string().max(20).nullish(),
  terminal: z.string().max(30).nullish(),
  baggageCount: z.number().int().min(0).max(99).nullish(),
  note: z.string().max(500).nullish(),
  acceptPolicy: z.literal(true),
  acceptKvkk: z.literal(true),
  acceptComms: z.boolean().optional().default(false),
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
