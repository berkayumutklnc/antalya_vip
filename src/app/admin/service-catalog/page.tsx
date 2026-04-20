"use client";

import { useEffect, useState } from "react";
import AdminGate from "@/components/AdminGate";
import { useI18n } from "@/lib/i18n-admin";

type Variant = {
  id: string;
  key: string;
  nameDe: string;
  nameEn: string;
  nameTr: string;
  nameRu: string;
  priceModifierEur: number;
  sortOrder: number;
  isActive: boolean;
};

type ServiceType = {
  id: string;
  slug: string;
  nameDe: string;
  nameEn: string;
  nameTr: string;
  nameRu: string;
  capacity: number;
  image: string;
  features: string[];
  sortOrder: number;
  isActive: boolean;
  isBookable: boolean;
  variants: Variant[];
};

async function fetchServiceTypes(token: string): Promise<ServiceType[]> {
  const res = await fetch("/api/admin/service-types", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load service types");
  const data = await res.json();
  return data.items ?? [];
}

async function patchServiceType(token: string, body: Record<string, unknown>) {
  const res = await fetch("/api/admin/service-types", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update service type");
}

async function patchVariant(token: string, body: Record<string, unknown>) {
  const res = await fetch("/api/admin/service-variants", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update variant");
}

function getToken(): string {
  // Read JWT from cookie (same pattern as other admin pages)
  const match = document.cookie.match(/(?:^|;\s*)sb-access-token=([^;]*)/);
  return match?.[1] ?? "";
}

export default function AdminServiceCatalogPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const token = getToken();
    const data = await fetchServiceTypes(token);
    setItems(data);
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function toggleBookable(st: ServiceType) {
    try {
      setSaving(true);
      const token = getToken();
      await patchServiceType(token, { id: st.id, isBookable: !st.isBookable });
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(st: ServiceType) {
    try {
      setSaving(true);
      const token = getToken();
      await patchServiceType(token, { id: st.id, isActive: !st.isActive });
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggleVariantActive(v: Variant) {
    try {
      setSaving(true);
      const token = getToken();
      await patchVariant(token, { id: v.id, isActive: !v.isActive });
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  async function updateVariantPrice(v: Variant, price: number) {
    try {
      setSaving(true);
      const token = getToken();
      await patchVariant(token, { id: v.id, priceModifierEur: price });
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminGate>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">{t("serviceCatalog.title") ?? "Service Catalog"}</h1>
        <div className="rounded border border-blue-600/30 bg-blue-900/10 p-3 text-sm text-blue-200">
          Commercial pricing rows use these Service Type IDs as the authoritative key.
        </div>

        {error && (
          <div className="rounded border border-red-600/40 bg-red-900/20 p-3 text-red-200">{error}</div>
        )}

        {loading ? (
          <div className="text-white/60">{t("common.loading")}</div>
        ) : (
          <div className="space-y-6">
            {items.map((st) => (
              <div key={st.id} className="rounded-lg border border-white/10 bg-neutral-900/50 p-4 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold">{st.nameEn}</div>
                    <div className="text-sm text-white/50">Service Type ID: {st.id} • Capacity: {st.capacity}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => toggleActive(st)}
                      disabled={saving}
                      className={`px-3 py-1 rounded text-sm ${
                        st.isActive ? "bg-green-700 hover:bg-green-800" : "bg-neutral-700 hover:bg-neutral-600"
                      }`}
                    >
                      {st.isActive ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => toggleBookable(st)}
                      disabled={saving}
                      className={`px-3 py-1 rounded text-sm ${
                        st.isBookable ? "bg-blue-700 hover:bg-blue-800" : "bg-neutral-700 hover:bg-neutral-600"
                      }`}
                    >
                      {st.isBookable ? "Bookable" : "Not Bookable"}
                    </button>
                  </div>
                </div>

                {/* Variants */}
                {st.variants.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white/70">{t("serviceCatalog.variants") ?? "Variants"}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {st.variants.map((v) => (
                        <div
                          key={v.id}
                          className="rounded border border-white/10 bg-neutral-800/50 p-3 flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-medium">{v.nameEn}</div>
                            <div className="text-xs text-white/50">Key: {v.key}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-white/50">+€</span>
                              <input
                                type="number"
                                value={v.priceModifierEur}
                                onChange={(e) => {
                                  const val = Number(e.target.value || "0");
                                  setItems((prev) =>
                                    prev.map((s) =>
                                      s.id === st.id
                                        ? {
                                            ...s,
                                            variants: s.variants.map((vv) =>
                                              vv.id === v.id ? { ...vv, priceModifierEur: val } : vv,
                                            ),
                                          }
                                        : s,
                                    ),
                                  );
                                }}
                                onBlur={(e) => updateVariantPrice(v, Number(e.target.value || "0"))}
                                className="w-16 px-2 py-1 rounded bg-neutral-900 border border-white/10 text-right text-sm"
                                min={0}
                                step={1}
                              />
                            </div>
                            <button
                              onClick={() => toggleVariantActive(v)}
                              disabled={saving}
                              className={`px-2 py-1 rounded text-xs ${
                                v.isActive ? "bg-green-700" : "bg-neutral-700"
                              }`}
                            >
                              {v.isActive ? "On" : "Off"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center text-white/50 py-8">
                No service types found. Run the Phase 2 migration first.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminGate>
  );
}
