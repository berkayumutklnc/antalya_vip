"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminGate from "@/components/AdminGate";
import StatusBadge from "@/components/admin/StatusBadge";
import NotificationLogPanel from "@/components/admin/NotificationLogPanel";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";

interface ResDetail {
  id: string;
  code: string;
  status: string;
  from: string;
  to: string;
  date: string;
  time: string;
  fullName: string;
  phone: string;
  email: string;
  adults: number;
  babySeat: number;
  vehicleType: string | null;
  vehicleId: string | null;
  plate: string | null;
  driverName: string | null;
  driverPhone: string | null;
  price: number | null;
  createdAt: number;
  updatedAt: number;
  cancel?: { requested: boolean; reason?: string } | null;
}

interface EventItem {
  id: string;
  type: string;
  timestamp: number;
  actorType: string;
  actorId: string | null;
  meta: Record<string, unknown>;
}

const EVENT_LABELS: Record<string, string> = {
  reservation_created: "Rezervasyon Oluşturuldu",
  status_changed: "Durum Değişikliği",
  vehicle_assigned: "Araç Atandı",
  cancel_requested: "İptal Talep Edildi",
  cancel_approved: "İptal Onaylandı",
  cancel_rejected: "İptal Reddedildi",
};

export default function ReservationDetailPage() {
  const { rid } = useParams<{ rid: string }>();
  const [res, setRes] = useState<ResDetail | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function getAuthHeaders(): Promise<HeadersInit> {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not authenticated");
    return { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const headers = await getAuthHeaders();

        const [resData, eventsData] = await Promise.all([
          fetch("/api/admin/reservations", { headers }).then(r => r.json()),
          fetch(`/api/admin/reservations/${rid}/events`, { headers }).then(r => r.json()),
        ]);

        if (!mounted) return;

        const all: any[] = resData.items || [];
        const found = all.find((r: any) => (r.rid || r.id || r.code) === rid);
        if (!found) {
          setError("Rezervasyon bulunamadı");
          return;
        }

        setRes({
          id: found.rid || found.id || found.code,
          code: found.code ?? found.rid ?? found.id,
          status: found.status ?? "pending",
          from: found.from ?? "",
          to: found.to ?? "",
          date: found.date ?? "",
          time: found.time ?? "",
          fullName: found.fullName ?? "",
          phone: found.phone ?? "",
          email: found.email ?? "",
          adults: Number(found.adults ?? 1),
          babySeat: Number(found.babySeat ?? 0),
          vehicleType: found.vehicleType ?? null,
          vehicleId: found.vehicleId ?? null,
          plate: found.plate ?? null,
          driverName: found.driverName ?? null,
          driverPhone: found.driverPhone ?? null,
          price: found.price ?? null,
          createdAt: found.createdAt ?? 0,
          updatedAt: found.updatedAt ?? 0,
          cancel: found.cancel ?? null,
        });

        setEvents(eventsData.events || []);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [rid]);

  return (
    <AdminGate>
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/reservations" className="text-white/60 hover:text-white">← Geri</Link>
          <h1 className="text-2xl font-bold">Rezervasyon Detay</h1>
        </div>

        {error && <div className="rounded border border-red-600/40 bg-red-900/20 p-3 text-red-200">{error}</div>}
        {loading && <div className="text-white/60">Yükleniyor...</div>}

        {res && (
          <>
            {/* Header */}
            <div className="rounded-lg border border-white/10 bg-neutral-900 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-bold">{res.code}</div>
                  <div className="text-sm text-white/60">ID: {res.id}</div>
                </div>
                <StatusBadge status={res.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-white/60 text-xs mb-1">Rota</div>
                  <div className="font-medium">{res.from} → {res.to}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Tarih / Saat</div>
                  <div className="font-medium">{res.date} {res.time}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Müşteri</div>
                  <div className="font-medium">{res.fullName}</div>
                  <div className="text-white/50">{res.phone} • {res.email}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Yolcu</div>
                  <div>Yetişkin: {res.adults} • Bebek Koltuk: {res.babySeat}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Araç</div>
                  <div>{res.vehicleType || "—"} {res.plate ? `• ${res.plate}` : ""}</div>
                  <div className="text-white/50">{res.driverName || ""} {res.driverPhone ? `• ${res.driverPhone}` : ""}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Fiyat</div>
                  <div>{res.price != null ? `€${res.price}` : "—"}</div>
                </div>
              </div>

              {res.cancel?.requested && (
                <div className="mt-3 rounded border border-yellow-700/40 bg-yellow-900/20 p-3 text-sm">
                  <div className="font-medium text-yellow-300">İptal Talebi</div>
                  <div className="text-white/70 mt-1">{res.cancel.reason || "Sebep belirtilmedi"}</div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="rounded-lg border border-white/10 bg-neutral-900 p-4">
              <h2 className="text-lg font-semibold mb-4">Olay Zaman Çizelgesi</h2>
              {events.length === 0 ? (
                <div className="text-white/50 text-sm">Henüz olay kaydı yok.</div>
              ) : (
                <div className="relative pl-6 border-l border-white/10 space-y-4">
                  {events.map((ev) => (
                    <div key={ev.id} className="relative">
                      <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-white/30 border-2 border-white/50" />
                      <div className="text-sm font-medium">
                        {EVENT_LABELS[ev.type] || ev.type}
                      </div>
                      <div className="text-xs text-white/50">
                        {new Date(ev.timestamp).toLocaleString()} • {ev.actorType}
                        {ev.actorId ? ` (${ev.actorId.slice(0, 8)}…)` : ""}
                      </div>
                      {ev.meta && Object.keys(ev.meta).length > 0 && (
                        <div className="mt-1 text-xs text-white/40">
                          {Object.entries(ev.meta)
                            .filter(([, v]) => v != null && v !== "")
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" • ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Log */}
            <NotificationLogPanel rid={rid} />
          </>
        )}
      </div>
    </AdminGate>
  );
}
