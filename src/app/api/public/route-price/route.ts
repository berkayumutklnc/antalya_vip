import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { computeQuotedPrice } from "@/lib/server/pricing";
import { validateBookingEligibility } from "@/lib/server/bookingGuard";
import { availabilityLimiter, getClientIp } from "@/lib/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/public/route-price — public price lookup (display only) */
export async function GET(req: Request) {
  const ip = getClientIp(req);
  if (!availabilityLimiter.check(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const fromKey = searchParams.get("from_key");
  const toKey = searchParams.get("to_key");
  const vehicleType = searchParams.get("vehicle_type");
  const variantKey = searchParams.get("variant_key") || undefined;

  if (!fromKey || !toKey || !vehicleType) {
    return NextResponse.json(
      { error: "from_key, to_key, and vehicle_type are required" },
      { status: 400 },
    );
  }

  const db = getAdminClient();
  const guard = await validateBookingEligibility(db, undefined, vehicleType, variantKey);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const result = await computeQuotedPrice(
    db,
    fromKey,
    toKey,
    guard.serviceTypeId,
    guard.serviceVariantKey,
  );

  if (result.quotedBasePrice === null || result.quotedTotalPrice === null) {
    return NextResponse.json(
      { error: "No price found for this route" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    basePriceEur: result.quotedBasePrice,
    variantSurcharge: result.variantSurcharge,
    totalPriceEur: result.quotedTotalPrice,
    currency: result.currency,
  });
}
