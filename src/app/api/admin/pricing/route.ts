import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { CreateRoutePriceSchema } from "@/lib/validation/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/pricing — list route prices */
export async function GET(req: Request) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();

    const { searchParams } = new URL(req.url);
    const fromKey = searchParams.get("from_key");
    const toKey = searchParams.get("to_key");
    const vehicleType = searchParams.get("vehicle_type");
    const activeOnly = searchParams.get("active_only") === "true";

    let query = db
      .from("route_prices")
      .select("*")
      .order("from_key")
      .order("to_key")
      .order("vehicle_type");

    if (fromKey) query = query.eq("from_key", fromKey);
    if (toKey) query = query.eq("to_key", toKey);
    if (vehicleType) query = query.eq("vehicle_type", vehicleType);
    if (activeOnly) query = query.eq("is_active", true);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const items = (data ?? []).map((d: any) => ({
      id: d.id,
      fromKey: d.from_key,
      toKey: d.to_key,
      serviceTypeId: d.vehicle_type,
      vehicleType: d.vehicle_type,
      basePriceEur: Number(d.base_price_eur),
      isActive: d.is_active,
      updatedBy: d.updated_by,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));

    return NextResponse.json({ items });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 },
    );
  }
}

/** POST /api/admin/pricing — create a route price */
export async function POST(req: Request) {
  try {
    const adminUid = await verifyAdminToken(req);
    const db = getAdminClient();
    const body = await req.json();

    const parsed = CreateRoutePriceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { fromKey, toKey, basePriceEur } = parsed.data;
    const serviceTypeId = parsed.data.serviceTypeId ?? parsed.data.vehicleType;
    const reactivateIfInactive = parsed.data.reactivateIfInactive ?? true;

    if (!serviceTypeId) {
      return NextResponse.json(
        { error: "serviceTypeId (or vehicleType) is required" },
        { status: 400 },
      );
    }

    if (fromKey === toKey) {
      return NextResponse.json(
        { error: "from and to must be different" },
        { status: 400 },
      );
    }

    const { data: serviceType, error: stErr } = await db
      .from("service_types")
      .select("id, is_active, is_bookable")
      .eq("id", serviceTypeId)
      .maybeSingle();

    if (stErr) throw new Error(stErr.message);
    if (!serviceType) {
      return NextResponse.json(
        { error: `Unknown service type: ${serviceTypeId}` },
        { status: 400 },
      );
    }

    // Check for existing row (active or inactive)
    const { data: existing } = await db
      .from("route_prices")
      .select("id, is_active")
      .eq("from_key", fromKey)
      .eq("to_key", toKey)
      .eq("vehicle_type", serviceTypeId)
      .maybeSingle();

    if (existing) {
      if (!existing.is_active) {
        if (!reactivateIfInactive) {
          return NextResponse.json(
            {
              error: "Inactive price row already exists for this route and service type",
              existingId: existing.id,
              canReactivate: true,
            },
            { status: 409 },
          );
        }

        // Reactivate with new price
        const { error } = await db
          .from("route_prices")
          .update({
            base_price_eur: basePriceEur,
            is_active: true,
            updated_by: adminUid,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
        return NextResponse.json(
          {
            id: existing.id,
            serviceTypeId,
            serviceTypeActive: serviceType.is_active,
            serviceTypeBookable: serviceType.is_bookable,
            reactivated: true,
            message: "Existing inactive row was reactivated with updated price",
          },
          { status: 200 },
        );
      }
      return NextResponse.json(
        {
          error: "Price already exists for this route and service type",
          existingId: existing.id,
          duplicate: true,
        },
        { status: 409 },
      );
    }

    const { data: created, error } = await db
      .from("route_prices")
      .insert({
        from_key: fromKey,
        to_key: toKey,
        vehicle_type: serviceTypeId,
        base_price_eur: basePriceEur,
        updated_by: adminUid,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(
      {
        id: created.id,
        fromKey: created.from_key,
        toKey: created.to_key,
        serviceTypeId: created.vehicle_type,
        serviceTypeActive: serviceType.is_active,
        serviceTypeBookable: serviceType.is_bookable,
        vehicleType: created.vehicle_type,
        basePriceEur: Number(created.base_price_eur),
        isActive: created.is_active,
      },
      { status: 201 },
    );
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 },
    );
  }
}
