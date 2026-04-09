/**
 * Validation schemas for public lookup and cancel endpoints.
 */

import { z } from "zod";

const PNR_CODE_REGEX = /^TRF-[A-Z0-9]{5,10}$/;

export const PublicLookupSchema = z.object({
  code: z
    .string()
    .min(1, "code is required")
    .max(20)
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => PNR_CODE_REGEX.test(v), { message: "Invalid code format" }),
  email: z
    .string()
    .email("Invalid email")
    .max(120)
    .transform((v) => v.trim().toLowerCase()),
});

export type PublicLookupInput = z.infer<typeof PublicLookupSchema>;

export const PublicCancelSchema = z.object({
  code: z
    .string()
    .min(1, "code is required")
    .max(20)
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => PNR_CODE_REGEX.test(v), { message: "Invalid code format" }),
  email: z
    .string()
    .email("Invalid email")
    .max(120)
    .transform((v) => v.trim().toLowerCase()),
  reason: z.string().max(500).optional().default(""),
});

export type PublicCancelInput = z.infer<typeof PublicCancelSchema>;
