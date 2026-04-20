import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";
import { UpdateRoutePriceSchema } from "@/lib/validation/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/admin/pricing/[id] — update a route price */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUid = await verifyAdminToken(req);
    const db = getAdminClient();
    const { id } = await params;
    const body = await req.json();

    const parsed = UpdateRoutePriceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    if (parsed.data.basePriceEur === undefined && parsed.data.isActive === undefined) {
      return NextResponse.json(
        { error: "At least one field (basePriceEur or isActive) is required" },
        { status: 400 },
      );
    }

    const { data: existing } = await db
      .from("route_prices")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const patch: Record<string, unknown> = {
      updated_by: adminUid,
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.basePriceEur !== undefined) {
      patch.base_price_eur = parsed.data.basePriceEur;
    }
    if (parsed.data.isActive !== undefined) {
      patch.is_active = parsed.data.isActive;
    }

    const { error } = await db.from("route_prices").update(patch).eq("id", id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
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

/** DELETE /api/admin/pricing/[id] — soft-delete (deactivate) a route price */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUid = await verifyAdminToken(req);
    const db = getAdminClient();
    const { id } = await params;

    const { data: existing } = await db
      .from("route_prices")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await db
      .from("route_prices")
      .update({
        is_active: false,
        updated_by: adminUid,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
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
