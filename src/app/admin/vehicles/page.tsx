"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import AdminGate from "@/components/AdminGate";
import type { Vehicle, VehicleType } from "@/types";
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addVehicleBlockSlot,
  removeVehicleBlockSlot,
} from "@/lib/vehicles";
import { addMinutes } from "@/utils/time";
import { useI18n } from "@/lib/i18n-admin";

type Tab = "list" | "new" | "edit";
const VEHICLE_TYPES: VehicleType[] = ["vip-6", "vip-10", "vip-16"];

function fmt(ms: number) {
  const d = new Date(ms);
  return d.toLocaleString();
}

export default function AdminVehiclesPage() {
  const { t } = useI18n();
  const [list, setList] = useState<Vehicle[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("list");
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const vs = await fetchVehicles();
    setList(vs);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await refresh();
      } catch (e:any) {
        setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let rows = list.slice();
    if (s) {
      rows = rows.filter(v =>
        v.id.toLowerCase().includes(s) ||
        (v.plate||"").toLowerCase().includes(s) ||
        (v.driverName||"").toLowerCase().includes(s) ||
        (v.driverPhone||"").toLowerCase().includes(s) ||
        (v.type||"").toLowerCase().includes(s)
      );
    }
    return rows.sort((a:any,b:any)=> String(a.type||"").localeCompare(String(b.type||"")));
  }, [list, q]);

  return (
    <AdminGate>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("vehicles.title")}</h1>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder={t("common.search.placeholder")}
              className="px-3 py-2 rounded bg-neutral-800 border border-white/10"
            />
            <button
              onClick={() => { setEditing(null); setTab("new"); }}
              className="px-3 py-2 rounded bg-green-700 hover:bg-green-800"
            >
              {t("vehicles.new")}
            </button>
          </div>
        </div>

        {error && <div className="rounded border border-red-600/40 bg-red-900/20 p-3 text-red-200">{error}</div>}
        {loading ? (
          <div className="text-white/60">{t("common.loading")}</div>
        ) : (
          <div className="rounded border border-white/10 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-800/60">
                <tr>
                  <th className="text-left p-2">{t("vehicles.col.id")}</th>
                  <th className="text-left p-2">{t("vehicles.col.type")}</th>
                  <th className="text-left p-2">{t("vehicles.col.plate")}</th>
                  <th className="text-left p-2">{t("vehicles.col.driver")}</th>
                  <th className="text-left p-2">{t("vehicles.col.blocks")}</th>
                  <th className="text-right p-2">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-t border-white/5">
                    <td className="p-2">{v.id}</td>
                    <td className="p-2">{v.type || t("common.none")}</td>
                    <td className="p-2">{v.plate || t("common.none")}</td>
                    <td className="p-2">
                      <div>{v.driverName || t("common.none")}</div>
                      <div className="text-xs text-white/50">{v.driverPhone || ""}</div>
                    </td>
                    <td className="p-2">
                      <div className="space-y-1">
                        {(v.blockedSlots || []).map((s:any, idx:number)=>(
                          <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-white/70">{fmt(s.startAt)} → {fmt(s.endAt)}</span>
                            <button
                              onClick={async ()=>{
                                if (!confirm("Bu blok kaldırılacak. Emin misiniz?")) return;
                                await removeVehicleBlockSlot(v.id, idx);
                                await refresh();
                              }}
                              className="px-2 py-0.5 rounded bg-neutral-700 hover:bg-neutral-600"
                            >
                              {t("vehicles.block.delete")}
                            </button>
                          </div>
                        ))}
                        {(!v.blockedSlots || v.blockedSlots.length===0) && <div className="text-xs text-white/50">{t("common.none")}</div>}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setEditing(v); setTab("edit"); }}
                          className="px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600"
                        >
                          {t("common.update")}
                        </button>
                        <button
                          onClick={async ()=>{
                            if (!confirm(`${v.id} silinsin mi?`)) return;
                            await deleteVehicle(v.id);
                            await refresh();
                          }}
                          className="px-3 py-1 rounded bg-red-700 hover:bg-red-800"
                        >
                          {t("common.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-white/60">{t("vehicles.none")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {(tab==="new" || (tab==="edit" && editing)) && (
          <VehicleForm
            key={editing?.id || "new"}
            mode={tab}
            initial={editing || undefined}
            onClose={() => { setTab("list"); setEditing(null); }}
            onSaved={async ()=>{ await refresh(); setTab("list"); setEditing(null); }}
          />
        )}
      </div>
    </AdminGate>
  );
}

function VehicleForm({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "new" | "edit";
  initial?: Vehicle;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const { t } = useI18n();
  const [id, setId] = useState(initial?.id || "");
  const [type, setType] = useState<VehicleType | null>((initial?.type as any) ?? null);
  const [plate, setPlate] = useState(initial?.plate || "");
  const [driverName, setDriverName] = useState(initial?.driverName || "");
  const [driverPhone, setDriverPhone] = useState(initial?.driverPhone || "");
  const [capacity, setCapacity] = useState<number | "">((initial as any)?.capacity ?? "");

  const [blkDate, setBlkDate] = useState<string>("");
  const [blkStart, setBlkStart] = useState<string>("09:00");
  const [blkMinutes, setBlkMinutes] = useState<number>(60);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toUtc(dateStr: string, timeStr: string) {
    const [y,m,d] = dateStr.split("-").map(Number);
    const [H,M] = timeStr.split(":").map(Number);
    return Date.UTC(y, m-1, d, H, M);
  }

  async function save() {
    try {
      setErr(null);
      setBusy(true);
      if (mode === "new") {
        await createVehicle({
          id: id.trim(),
          type: type ?? null,
          plate: plate.trim() || null,
          driverName: driverName.trim() || null,
          driverPhone: driverPhone.trim() || null,
          capacity: typeof capacity==="number" ? capacity : null,
        });
      } else {
        await updateVehicle({
          id: id.trim(),
          type: type ?? null,
          plate: plate.trim() || null,
          driverName: driverName.trim() || null,
          driverPhone: driverPhone.trim() || null,
          capacity: typeof capacity==="number" ? capacity : null,
        });
      }

      if (blkDate) {
        const start = toUtc(blkDate, blkStart);
        const end = start + blkMinutes*60*1000;
        await addVehicleBlockSlot(id.trim(), {
          startAt: start,
          endAt: end,
          reason: "manual",
          driverName: driverName || null,
          driverPhone: driverPhone || null,
          plate: plate || null,
          type: (type as any) ?? null,
        });
      }

      await onSaved();
    } catch (e:any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-neutral-900 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{mode==="new" ? t("vehicles.form.create") : t("vehicles.form.edit")}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700">{t("common.close")}</button>
        </div>

        {err && <div className="rounded border border-red-600/40 bg-red-900/20 p-2 text-red-200 text-sm">{err}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/60 mb-1">{t("vehicles.form.id")}</label>
            <input value={id} onChange={(e)=>setId(e.target.value)} disabled={mode==="edit"} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10" />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">{t("vehicles.form.type")}</label>
            <select value={String(type||"")} onChange={(e)=>setType((e.target.value||null) as any)} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10">
              <option value="">{t("common.none")}</option>
              {VEHICLE_TYPES.map(ti => <option key={ti as any} value={ti as any}>{ti}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">{t("vehicles.form.plate")}</label>
            <input value={plate} onChange={(e)=>setPlate(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10" />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">{t("vehicles.form.driverName")}</label>
            <input value={driverName} onChange={(e)=>setDriverName(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10" />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">{t("vehicles.form.driverPhone")}</label>
            <input value={driverPhone} onChange={(e)=>setDriverPhone(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10" />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">{t("vehicles.form.capacity")}</label>
            <input type="number" value={capacity} onChange={(e)=>setCapacity(e.target.value===""? "": Number(e.target.value))} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs text-white/60 mb-1">{t("vehicles.form.blockDate")}</label>
            <input type="date" value={blkDate} onChange={(e)=>setBlkDate(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10" />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">{t("vehicles.form.blockStart")}</label>
            <input type="time" value={blkStart} onChange={(e)=>setBlkStart(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10" />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">{t("vehicles.form.blockMinutes")}</label>
            <input type="number" value={blkMinutes} onChange={(e)=>setBlkMinutes(Number(e.target.value||"60"))} className="w-full px-3 py-2 rounded bg-neutral-800 border border-white/10" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700">{t("common.cancel")}</button>
          <button onClick={save} disabled={!id || busy} className={`px-3 py-2 rounded ${!id || busy ? "bg-neutral-700 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"}`}>
            {busy ? t("common.loading") : (mode==="new" ? t("common.add") : t("common.update"))}
          </button>
        </div>
      </div>
    </div>
  );
}
