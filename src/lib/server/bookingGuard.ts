/**
 * Public booking authority guards.
 *
 * Validates service type + variant eligibility against the DB before
 * allowing a public reservation to proceed. This is the single
 * enforcement point — the route calls these checks before insert.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** Service types that are blocked from new public bookings. */
const BLOCKED_SERVICE_TYPES = ["vip-6"] as const;

type BookingGuardOk = {
  ok: true;
  serviceTypeId: string;
  serviceVariantKey: string | null;
};

type BookingGuardFail = {
  ok: false;
  error: string;
  status: 400 | 409;
};

export type BookingGuardResult = BookingGuardOk | BookingGuardFail;

/**
 * Validate that the requested service type + variant are eligible
 * for a new public booking. Checks:
 *  1. serviceTypeId is required
 *  2. serviceTypeId is not in the blocked list (vip-6)
 *  3. service type exists in DB, is_active=true, is_bookable=true
 *  4. If serviceVariantKey provided, it must exist for that type and be active
 */
export async function validateBookingEligibility(
  db: SupabaseClient,
  serviceTypeId: string | undefined | null,
  vehicleType: string | undefined | null,
  serviceVariantKey: string | undefined | null,
): Promise<BookingGuardResult> {
  // Resolve the authoritative service type
  const resolvedTypeId = serviceTypeId || vehicleType;

  if (!resolvedTypeId) {
    return { ok: false, error: "serviceTypeId is required", status: 400 };
  }

  // Block vip-6 for new public bookings
  if ((BLOCKED_SERVICE_TYPES as readonly string[]).includes(resolvedTypeId)) {
    return {
      ok: false,
      error: `Service type "${resolvedTypeId}" is not available for new bookings`,
      status: 400,
    };
  }

  // Check service type exists + is active + is bookable
  const { data: serviceType, error: stErr } = await db
    .from("service_types")
    .select("id, is_active, is_bookable")
    .eq("id", resolvedTypeId)
    .maybeSingle();

  if (stErr) {
    console.error("[bookingGuard] service_types query error:", stErr.message);
    return { ok: false, error: "Failed to validate service type", status: 400 };
  }

  if (!serviceType) {
    return {
      ok: false,
      error: `Service type "${resolvedTypeId}" does not exist`,
      status: 400,
    };
  }

  if (!serviceType.is_active) {
    return {
      ok: false,
      error: `Service type "${resolvedTypeId}" is currently inactive`,
      status: 409,
    };
  }

  if (!serviceType.is_bookable) {
    return {
      ok: false,
      error: `Service type "${resolvedTypeId}" is not available for booking`,
      status: 409,
    };
  }

  // Validate variant if provided
  if (serviceVariantKey) {
    const { data: variant, error: vErr } = await db
      .from("service_variants")
      .select("id, is_active")
      .eq("service_type_id", resolvedTypeId)
      .eq("key", serviceVariantKey)
      .maybeSingle();

    if (vErr) {
      console.error("[bookingGuard] service_variants query error:", vErr.message);
      return { ok: false, error: "Failed to validate service variant", status: 400 };
    }

    if (!variant) {
      return {
        ok: false,
        error: `Variant "${serviceVariantKey}" does not exist for service type "${resolvedTypeId}"`,
        status: 400,
      };
    }

    if (!variant.is_active) {
      return {
        ok: false,
        error: `Variant "${serviceVariantKey}" is currently inactive`,
        status: 409,
      };
    }
  }

  return {
    ok: true,
    serviceTypeId: resolvedTypeId,
    serviceVariantKey: serviceVariantKey ?? null,
  };
}
