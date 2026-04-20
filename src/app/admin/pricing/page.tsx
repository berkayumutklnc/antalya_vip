"use client";

import { useEffect, useMemo, useState } from "react";
import AdminGate from "@/components/AdminGate";
import { useI18n } from "@/lib/i18n-admin";
import { getSupabaseClient } from "@/lib/supabase";
import { PLACES } from "@/config/places";

type RoutePrice = {
  id: string;
  fromKey: string;
  toKey: string;
  serviceTypeId?: string;
  vehicleType: string;
  basePriceEur: number;
  isActive: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type ServiceType = {
  id: string;
  nameDe: string;
  nameEn: string;
  nameTr: string;
  nameRu: string;
  isActive: boolean;
  isBookable: boolean;
};

const PLACE_OPTIONS = PLACES;

const LEGACY_SERVICE_TYPES = ["vip-6"] as const;

function placeLabel(key: string): string {
  return PLACE_OPTIONS.find((p) => p.id === key)?.label ?? key;
}

async function getToken(): Promise<string> {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? "";
}

export default function AdminPricingPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<RoutePrice[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterServiceType, setFilterServiceType] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [showLegacyRows, setShowLegacyRows] = useState(false);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newServiceTypeId, setNewServiceTypeId] = useState<string>("");
  const [newPrice, setNewPrice] = useState("");
  const [createReverseDirection, setCreateReverseDirection] = useState(false);
  const [showInactiveCatalogTypes, setShowInactiveCatalogTypes] = useState(false);
  const [showLegacyCatalogTypes, setShowLegacyCatalogTypes] = useState(false);

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const serviceTypeLabelById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const st of serviceTypes) {
      map[st.id] = st.nameEn || st.nameDe || st.nameTr || st.nameRu || st.id;
    }
    return map;
  }, [serviceTypes]);

  const catalogCreateOptions = useMemo(() => {
    return serviceTypes.filter((st) => {
      if (!showLegacyCatalogTypes && (LEGACY_SERVICE_TYPES as readonly string[]).includes(st.id)) return false;
      if (!showInactiveCatalogTypes && (!st.isActive || !st.isBookable)) return false;
      return true;
    });
  }, [serviceTypes, showInactiveCatalogTypes, showLegacyCatalogTypes]);

  const filterServiceTypeOptions = useMemo(() => {
    return serviceTypes.filter((st) => {
      if (!showLegacyRows && (LEGACY_SERVICE_TYPES as readonly string[]).includes(st.id)) return false;
      return true;
    });
  }, [serviceTypes, showLegacyRows]);

  async function refresh() {
    const token = await getToken();
    const [pricingRes, catalogRes] = await Promise.all([
      fetch("/api/admin/pricing", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("/api/admin/service-types", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!pricingRes.ok) throw new Error("Failed to load pricing");
    if (!catalogRes.ok) throw new Error("Failed to load service catalog");

    const pricingData = await pricingRes.json();
    const catalogData = await catalogRes.json();

    setItems(pricingData.items ?? []);
    setServiceTypes(catalogData.items ?? []);

    if (!newServiceTypeId) {
      const preferred = (catalogData.items ?? []).find((x: ServiceType) => {
        if ((LEGACY_SERVICE_TYPES as readonly string[]).includes(x.id)) return false;
        return x.isActive && x.isBookable;
      });
      if (preferred?.id) setNewServiceTypeId(preferred.id);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setInfo(null);
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (filterFrom && r.fromKey !== filterFrom) return false;
      if (filterTo && r.toKey !== filterTo) return false;
      const serviceTypeId = r.serviceTypeId ?? r.vehicleType;
      if (filterServiceType && serviceTypeId !== filterServiceType) return false;
      if (!showLegacyRows && (LEGACY_SERVICE_TYPES as readonly string[]).includes(serviceTypeId)) return false;
      if (!showInactive && !r.isActive) return false;
      return true;
    });
  }, [items, filterFrom, filterTo, filterServiceType, showInactive, showLegacyRows]);

  async function createPrice(args: {
    fromKey: string;
    toKey: string;
    serviceTypeId: string;
    basePriceEur: number;
  }) {
    const token = await getToken();
    const res = await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        fromKey: args.fromKey,
        toKey: args.toKey,
        serviceTypeId: args.serviceTypeId,
        basePriceEur: args.basePriceEur,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false as const, status: res.status, error: data?.error || "Create failed" };
    }
    return {
      ok: true as const,
      reactivated: Boolean(data?.reactivated),
    };
  }

  async function handleCreate() {
    if (!newFrom || !newTo || !newServiceTypeId || !newPrice) return;
    if (newFrom === newTo) {
      setError("From and To must be different");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setInfo(null);

      const basePriceEur = Number(newPrice);
      const forward = await createPrice({
        fromKey: newFrom,
        toKey: newTo,
        serviceTypeId: newServiceTypeId,
        basePriceEur,
      });

      if (!forward.ok) {
        throw new Error(forward.error);
      }

      const infoMessages: string[] = [
        forward.reactivated
          ? "Forward direction existed as inactive and was reactivated"
          : "Forward direction price created",
      ];

      if (createReverseDirection) {
        const reverse = await createPrice({
          fromKey: newTo,
          toKey: newFrom,
          serviceTypeId: newServiceTypeId,
          basePriceEur,
        });

        if (reverse.ok) {
          infoMessages.push(
            reverse.reactivated
              ? "Reverse direction existed as inactive and was reactivated"
              : "Reverse direction price created",
          );
        } else if (reverse.status === 409) {
          infoMessages.push("Reverse direction already existed, kept as-is");
        } else {
          infoMessages.push(`Reverse direction failed: ${reverse.error}`);
        }
      }

      setInfo(infoMessages.join(". "));
      setShowCreate(false);
      setNewFrom("");
      setNewTo("");
      setNewPrice("");
      setCreateReverseDirection(false);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editPrice) return;
    try {
      setSaving(true);
      setError(null);
      const token = await getToken();
      const res = await fetch(`/api/admin/pricing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ basePriceEur: Number(editPrice) }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingId(null);
      setEditPrice("");
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, currentActive: boolean) {
    try {
      setSaving(true);
      setError(null);
      const token = await getToken();
      const res = await fetch(`/api/admin/pricing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deactivate this price?")) return;
    try {
      setSaving(true);
      setError(null);
      const token = await getToken();
      const res = await fetch(`/api/admin/pricing/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminGate>
      <div className="p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">{t("pricing.title") ?? "Route Pricing"}</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 rounded bg-green-700 hover:bg-green-800 text-sm font-medium"
          >
            {showCreate ? t("common.cancel") : (t("pricing.addNew") ?? "+ New Price")}
          </button>
        </div>

        {error && (
          <div className="rounded border border-red-600/40 bg-red-900/20 p-3 text-red-200">{error}</div>
        )}
        {info && (
          <div className="rounded border border-emerald-600/40 bg-emerald-900/20 p-3 text-emerald-200">{info}</div>
        )}

        <div className="rounded border border-amber-600/30 bg-amber-900/10 p-3 text-sm text-amber-200">
          vip-6 is legacy-only. Commercial price management is centered on active and bookable service types.
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="rounded-lg border border-white/10 bg-neutral-900/50 p-4 space-y-3">
            <h3 className="font-semibold">{t("pricing.addNew") ?? "New Route Price"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">From</label>
                <select value={newFrom} onChange={(e) => setNewFrom(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10">
                  <option value="">—</option>
                  {PLACE_OPTIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">To</label>
                <select value={newTo} onChange={(e) => setNewTo(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10">
                  <option value="">—</option>
                  {PLACE_OPTIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Service Type</label>
                <select value={newServiceTypeId} onChange={(e) => setNewServiceTypeId(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10">
                  <option value="">—</option>
                  {catalogCreateOptions.map((st) => (
                    <option key={st.id} value={st.id}>
                      {serviceTypeLabelById[st.id] || st.id} ({st.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Price (€)</label>
                <input
                  type="number"
                  min={1}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const from = newFrom;
                  setNewFrom(newTo);
                  setNewTo(from);
                }}
                className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-xs"
              >
                Swap from/to
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createReverseDirection}
                  onChange={(e) => setCreateReverseDirection(e.target.checked)}
                />
                Create reverse direction with same price
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showInactiveCatalogTypes}
                  onChange={(e) => setShowInactiveCatalogTypes(e.target.checked)}
                />
                Include inactive/non-bookable service types
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showLegacyCatalogTypes}
                  onChange={(e) => setShowLegacyCatalogTypes(e.target.checked)}
                />
                Include legacy service types
              </label>
            </div>
            <button
              onClick={handleCreate}
              disabled={saving || !newFrom || !newTo || !newServiceTypeId || !newPrice}
              className={`px-4 py-2 rounded text-sm font-medium ${
                saving || !newFrom || !newTo || !newServiceTypeId || !newPrice
                  ? "bg-neutral-700 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              }`}
            >
              {saving ? t("common.loading") : (t("common.add") ?? "Create")}
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-white/60 mb-1">From</label>
            <select value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="px-3 py-2 rounded bg-neutral-800 border border-white/10 text-sm">
              <option value="">All</option>
              {PLACE_OPTIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">To</label>
            <select value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="px-3 py-2 rounded bg-neutral-800 border border-white/10 text-sm">
              <option value="">All</option>
              {PLACE_OPTIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Service Type</label>
            <select value={filterServiceType} onChange={(e) => setFilterServiceType(e.target.value)} className="px-3 py-2 rounded bg-neutral-800 border border-white/10 text-sm">
              <option value="">All</option>
              {filterServiceTypeOptions.map((st) => (
                <option key={st.id} value={st.id}>
                  {serviceTypeLabelById[st.id] || st.id} ({st.id})
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
            Show inactive
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={showLegacyRows} onChange={(e) => setShowLegacyRows(e.target.checked)} />
            Show legacy service types
          </label>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-white/60">{t("common.loading")}</div>
        ) : (
          <>
            <div className="text-sm text-white/50">{filtered.length} prices</div>
            <div className="rounded border border-white/10 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-800/60">
                  <tr>
                    <th className="text-left p-2">From</th>
                    <th className="text-left p-2">To</th>
                    <th className="text-left p-2">Service Type</th>
                    <th className="text-right p-2">Price (€)</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-right p-2">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t border-white/5">
                      <td className="p-2">{placeLabel(r.fromKey)}</td>
                      <td className="p-2">{placeLabel(r.toKey)}</td>
                      <td className="p-2">
                        <div className="font-medium">
                          {serviceTypeLabelById[r.serviceTypeId ?? r.vehicleType] || r.serviceTypeId || r.vehicleType}
                        </div>
                        <div className="text-xs text-white/50">{r.serviceTypeId ?? r.vehicleType}</div>
                        {(LEGACY_SERVICE_TYPES as readonly string[]).includes(r.serviceTypeId ?? r.vehicleType) && (
                          <span className="ml-2 rounded bg-amber-900/40 px-2 py-0.5 text-xs text-amber-300">legacy</span>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {editingId === r.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-20 px-2 py-1 rounded bg-neutral-900 border border-white/10 text-right text-sm"
                              min={1}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleUpdate(r.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                            <button onClick={() => handleUpdate(r.id)} disabled={saving} className="px-2 py-1 rounded bg-blue-700 text-xs">✓</button>
                            <button onClick={() => setEditingId(null)} className="px-2 py-1 rounded bg-neutral-700 text-xs">✕</button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:text-blue-400"
                            onClick={() => { setEditingId(r.id); setEditPrice(String(r.basePriceEur)); }}
                            title="Click to edit"
                          >
                            €{r.basePriceEur}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleToggle(r.id, r.isActive)}
                          disabled={saving}
                          className={`px-2 py-1 rounded text-xs ${
                            r.isActive ? "bg-green-700/60 text-green-200" : "bg-neutral-700 text-white/50"
                          }`}
                        >
                          {r.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={saving}
                          className="px-2 py-1 rounded bg-red-800/60 hover:bg-red-700 text-xs"
                        >
                          {t("common.delete") ?? "Deactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-white/50">
                        No prices found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminGate>
  );
}
