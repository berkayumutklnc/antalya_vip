import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { verifyAdminToken, AuthError } from "@/lib/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/service-types — list all service types + variants */
export async function GET(req: Request) {
  try {
    await verifyAdminToken(req);
    const db = getAdminClient();

    const { data: types, error: tErr } = await db
      .from("service_types")
      .select("*")
      .order("sort_order");

    if (tErr) throw new Error(tErr.message);

    const { data: variants, error: vErr } = await db
      .from("service_variants")
      .select("*")
      .order("sort_order");

    if (vErr) throw new Error(vErr.message);

    const items = (types ?? []).map((t: any) => ({
      id: t.id,
      slug: t.slug,
      nameDe: t.name_de,
      nameEn: t.name_en,
      nameTr: t.name_tr,
      nameRu: t.name_ru,
      capacity: t.capacity,
      image: t.image,
      features: t.features ?? [],
      sortOrder: t.sort_order,
      isActive: t.is_active,
      isBookable: t.is_bookable,
      variants: (variants ?? [])
        .filter((v: any) => v.service_type_id === t.id)
        .map((v: any) => ({
          id: v.id,
          key: v.key,
          nameDe: v.name_de,
          nameEn: v.name_en,
          nameTr: v.name_tr,
          nameRu: v.name_ru,
          priceModifierEur: Number(v.price_modifier_eur),
          sortOrder: v.sort_order,
          isActive: v.is_active,
        })),
    }));

    return NextResponse.json({ items });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

/** PATCH /api/admin/service-types — update a service type */
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
    if (fields.capacity !== undefined) update.capacity = Number(fields.capacity);
    if (fields.image !== undefined) update.image = String(fields.image);
    if (fields.features !== undefined) update.features = fields.features;
    if (fields.sortOrder !== undefined) update.sort_order = Number(fields.sortOrder);
    if (fields.isActive !== undefined) update.is_active = Boolean(fields.isActive);
    if (fields.isBookable !== undefined) update.is_bookable = Boolean(fields.isBookable);

    const { error } = await db.from("service_types").update(update).eq("id", id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
