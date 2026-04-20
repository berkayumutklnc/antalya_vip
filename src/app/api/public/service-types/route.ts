import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { getPublicBookableServiceTypes } from "@/lib/public/serviceCatalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/public/service-types — list active+bookable service types + variants */
export async function GET() {
  try {
    const db = getAdminClient();

    const { data: types, error: tErr } = await db
      .from("service_types")
      .select("*")
      .eq("is_active", true)
      .eq("is_bookable", true)
      .neq("id", "vip-6")
      .order("sort_order");

    if (tErr) throw new Error(tErr.message);

    const publicTypes = getPublicBookableServiceTypes(types ?? []);
    const typeIds = publicTypes.map((t: any) => t.id);

    let variants: any[] = [];
    if (typeIds.length > 0) {
      const { data, error: vErr } = await db
        .from("service_variants")
        .select("*")
        .in("service_type_id", typeIds)
        .eq("is_active", true)
        .order("sort_order");

      if (vErr) throw new Error(vErr.message);
      variants = data ?? [];
    }

    const items = publicTypes.map((t: any) => ({
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
      variants: variants
        .filter((v: any) => v.service_type_id === t.id)
        .map((v: any) => ({
          key: v.key,
          nameDe: v.name_de,
          nameEn: v.name_en,
          nameTr: v.name_tr,
          nameRu: v.name_ru,
          priceModifierEur: Number(v.price_modifier_eur),
          sortOrder: v.sort_order,
        })),
    }));

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error("[public/service-types]", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
