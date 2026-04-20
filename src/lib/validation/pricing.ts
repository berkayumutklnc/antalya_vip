import { z } from "zod";
import { PLACES } from "@/config/places";

const placeKeys = PLACES.map((p) => p.id) as unknown as [string, ...string[]];
const vehicleTypes = ["vip-6", "vip-10", "vip-16"] as const;

export const CreateRoutePriceSchema = z
  .object({
    fromKey: z.enum(placeKeys),
    toKey: z.enum(placeKeys),
    // New preferred field for commercial model language
    serviceTypeId: z.string().max(50).optional(),
    // Backward compatibility field
    vehicleType: z.enum(vehicleTypes).optional(),
    basePriceEur: z.number().positive().max(99999),
    reactivateIfInactive: z.boolean().optional().default(true),
  })
  .refine((v) => Boolean(v.serviceTypeId || v.vehicleType), {
    path: ["serviceTypeId"],
    message: "serviceTypeId (or vehicleType) is required",
  });

export const UpdateRoutePriceSchema = z.object({
  basePriceEur: z.number().positive().max(99999).optional(),
  isActive: z.boolean().optional(),
});

export type CreateRoutePriceInput = z.infer<typeof CreateRoutePriceSchema>;
export type UpdateRoutePriceInput = z.infer<typeof UpdateRoutePriceSchema>;
