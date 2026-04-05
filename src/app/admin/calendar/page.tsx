"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import AdminGate from "@/components/AdminGate";
import type { Reservation, Vehicle } from "@/types";
import { listReservations } from "@/lib/reservations";
import { fetchVehicles, addVehicleBlockSlot, removeVehicleBlockSlot } from "@/lib/vehicles";
import { addMinutes } from "@/utils/time";
import { useI18n } from "@/lib/i18n-admin";

function toMs(dateStr: string, timeStr: string) {
  const [y,m,d] = dateStr.split("-").map(Number);
  const [H,M] = timeStr.split(":").map(Number);
  return Date.UTC(y, m-1, d, H, M);
}

function resolveStartAt(rec: Reservation) {
  if (typeof (rec as any).startAt === "number" && (rec as any).startAt > 0) {
    const n = Number((rec as any).startAt);
    return n < 1e12 ? n * 1000 : n;
  }
  return toMs(rec.date, rec.time);
}

export default function AdminCalendarPage() {
  const { t } = useI18n();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string>("all");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [blkStart, setBlkStart] = useState("09:00");
  const [blkMinutes, setBlkMinutes] = useState(60);

  async function refresh() {
    const [rs, vs] = await Promise.all([listReservations(), fetchVehicles()]);
    setReservations(rs);
    setVehicles(vs);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await refresh();
      } catch (e:any) {
        setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const dayStart = useMemo(() => new Date(date+"T00:00:00Z").getTime(), [date]);
  const dayEnd = useMemo(() => addMinutes(dayStart, 24*60), [dayStart]);

  const events = useMemo(() => {
    const evs: Array<{ id: string; title: string; start: number; end: number; color: string; meta: any }> = [];

    reservations.forEach(r => {
      const start = resolveStartAt(r);
      const end = addMinutes(start, 60);
      if (start >= dayStart && start < dayEnd) {
        evs.push({
          id: r.id,
          title: `${r.from} → ${r.to} • ${r.fullName}`,
          start, end,
          color: r.status === "confirmed" ? "#16a34a" : "#f59e0b",
          meta: { type: "reservation", r }
        });
      }
    });

    vehicles.forEach(v => {
      if (vehicleId !== "all" && v.id !== vehicleId) return;
      const slots = (v as any).blockedSlots || [];
      slots.forEach((s: any, idx: number) => {
        const start = Number(s.startAt);
        const end = Number(s.endAt);
        if (!(start < dayEnd && end > dayStart)) return;
        evs.push({
          id: `${v.id}#${idx}`,
          title: `Blok • ${v.plate || v.id}`,
          start: Math.max(start, dayStart),
          end: Math.min(end, dayEnd),
          color: "#dc2626",
          meta: { type: "block", v, idx }
        });
      });
    });

    return evs.sort((a,b)=> a.start - b.start);
  }, [reservations, vehicles, dayStart, dayEnd, vehicleId]);

  async function addBlock() {
    const vid = vehicleId === "all" ? vehicles[0]?.id : vehicleId;
    if (!vid) return alert("Önce bir araç seçin.");
    const start = toMs(date, blkStart);
    const end = addMinutes(start, blkMinutes);
    try {
      await addVehicleBlockSlot(vid, { startAt: start, endAt: end, reason: "manual" });
      await refresh();
    } catch (e:any) {
      alert(e?.message ?? String(e));
    }
  }

  async function removeBlock(vId: string, idx: number) {
    if (!confirm("Bu blok kaldırılacak. Emin misiniz?")) return;
    try {
      await removeVehicleBlockSlot(vId, idx);
      await refresh();
    } catch (e:any) {
      alert(e?.message ?? String(e));
    }
  }

  return (
    <AdminGate>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">{t("calendar.title")}</h1>
          <div className="flex items-center gap-2">
            <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="px-3 py-2 rounded bg-neutral-800 border border-white/10" />
            <select value={vehicleId} onChange={(e)=>setVehicleId(e.target.value)} className="px-3 py-2 rounded bg-neutral-800 border border-white/10">
              <option value="all">{t("calendar.allVehicles")}</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate || v.id}</option>)}
            </select>
            <input type="time" value={blkStart} onChange={(e)=>setBlkStart(e.target.value)} className="px-3 py-2 rounded bg-neutral-800 border border-white/10" />
            <input type="number" value={blkMinutes} onChange={(e)=>setBlkMinutes(Number(e.target.value||"60"))} className="w-28 px-3 py-2 rounded bg-neutral-800 border border-white/10" />
            <button onClick={addBlock} className="px-3 py-2 rounded bg-red-700 hover:bg-red-800">{t("calendar.addBlock")}</button>
          </div>
        </div>

        {error && <div className="rounded border border-red-600/40 bg-red-900/20 p-3 text-red-200">{error}</div>}
        {loading ? (
          <div className="text-white/60">Loading…</div>
        ) : (
          <div className="rounded border border-white/10 p-3">
            <Timeline events={events} onRemoveBlock={removeBlock} removeLabel={t("calendar.remove")} />
          </div>
        )}
      </div>
    </AdminGate>
  );
}

function Timeline({
  events,
  onRemoveBlock,
  removeLabel,
}: {
  events: Array<{ id: string; title: string; start: number; end: number; color: string; meta: any }>;
  onRemoveBlock: (vehicleId: string, idx: number) => void;
  removeLabel: string;
}) {
  const hours = Array.from({length: 24}, (_,i)=>i);
  const start = (d: number) => (new Date(d).getUTCHours()*60 + new Date(d).getUTCMinutes());
  const dur = (a: number, b: number) => Math.max(5, Math.round((b-a)/60000));

  return (
    <div className="relative">
      <div className="grid grid-cols-[60px_1fr] gap-2">
        <div className="space-y-6">
          {hours.map(h => <div key={h} className="h-12 text-xs text-white/60">{String(h).padStart(2,"0")}:00</div>)}
        </div>
        <div className="relative">
          <div className="absolute inset-0">
            {hours.map(h => (
              <div key={h} className="border-t border-white/10 h-12" />
            ))}
          </div>
          <div className="relative">
            {events.map(ev => {
              const top = Math.max(0, Math.min(24*48, (start(ev.start)/60) * 48));
              const height = Math.max(10, Math.min(24*48, (dur(ev.start, ev.end)/60) * 48));
              const isBlock = ev.meta?.type === "block";
              return (
                <div
                  key={ev.id}
                  className="absolute left-2 right-2 rounded shadow"
                  style={{ top: `${top}px`, height: `${height}px`, background: ev.color, opacity: 0.9 }}
                  title={ev.title}
                >
                  <div className="text-xs p-2 flex items-center justify-between gap-2">
                    <span className="line-clamp-2">{ev.title}</span>
                    {isBlock && (
                      <button
                        onClick={()=> onRemoveBlock(ev.meta.v.id, ev.meta.idx)}
                        className="px-2 py-0.5 rounded bg-neutral-900/50 hover:bg-neutral-900/80 text-white"
                      >
                        {removeLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ height: `${24*48}px` }} />
        </div>
      </div>
    </div>
  );
}
