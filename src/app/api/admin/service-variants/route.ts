import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/admin/service-variants — update a variant */
export async function PATCH(req: Request) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (fields.nameDe !== undefined) update.name_de = String(fields.nameDe);
    if (fields.nameEn !== undefined) update.name_en = String(fields.nameEn);
    if (fields.nameTr !== undefined) update.name_tr = String(fields.nameTr);
    if (fields.nameRu !== undefined) update.name_ru = String(fields.nameRu);
    if (fields.priceModifierEur !== undefined) update.price_modifier_eur = Number(fields.priceModifierEur);
    if (fields.sortOrder !== undefined) update.sort_order = Number(fields.sortOrder);
    if (fields.isActive !== undefined) update.is_active = Boolean(fields.isActive);

    const { error } = await db.from("service_variants").update(update).eq("id", id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
