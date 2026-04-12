"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { fetchVehicles } from "@/lib/vehicles";
import type { Vehicle } from "@/types";
import { useI18n } from "@/lib/i18n-admin";

interface Metrics {
  pending: number;
  confirmed: number;
  cancelRequests: number;
  todayTrips: number;
  completedTotal: number;
  vehicles: number;
}

export default function AdminHomePage() {
  const { t } = useI18n();
  const [m, setM] = useState<Metrics>({ pending: 0, confirmed: 0, cancelRequests: 0, todayTrips: 0, completedTotal: 0, vehicles: 0 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        const headers = { Authorization: `Bearer ${session?.access_token ?? ""}` };
        const [resData, vs] = await Promise.all([
          fetch("/api/admin/reservations", { headers }).then(r => r.json()),
          fetchVehicles(),
        ]);
        if (!mounted) return;
        const rs: any[] = resData.items || [];
        const todayStr = new Date().toISOString().slice(0, 10);
        setM({
          pending: rs.filter(r => r.status === "pending").length,
          confirmed: rs.filter(r => r.status === "confirmed").length,
          cancelRequests: rs.filter(r => r.cancel?.requested && r.status !== "canceled").length,
          todayTrips: rs.filter(r => r.date === todayStr && (r.status === "confirmed" || r.status === "completed")).length,
          completedTotal: rs.filter(r => r.status === "completed").length,
          vehicles: vs.length,
        });
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const cards = [
    { href: "/admin/reservations", title: t("nav.reservations"), kpi: `${m.pending}`, subtitle: t("dashboard.openReservations"), accent: m.pending > 0 ? "border-yellow-500/40 bg-yellow-500/5" : "" },
    { href: "/admin/reservations", title: "İptal Talepleri", kpi: `${m.cancelRequests}`, subtitle: "Onay bekleyen talepler", accent: m.cancelRequests > 0 ? "border-red-500/40 bg-red-500/5" : "" },
    { href: "/admin/reservations", title: "Bugünkü Transferler", kpi: `${m.todayTrips}`, subtitle: "Onaylı & tamamlanan", accent: m.todayTrips > 0 ? "border-blue-500/30 bg-blue-500/5" : "" },
    { href: "/admin/reservations", title: "Onaylı Rezervasyonlar", kpi: `${m.confirmed}`, subtitle: "Atanmış transferler", accent: m.confirmed > 0 ? "border-green-500/30 bg-green-500/5" : "" },
    { href: "/admin/vehicles", title: t("nav.vehicles"), kpi: `${m.vehicles}`, subtitle: t("dashboard.vehicles"), accent: "" },
    { href: "/admin/calendar", title: t("nav.calendar"), kpi: "D", subtitle: "Günlük görünüm", accent: "" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <div className="text-white/60">{t("dashboard.subtitle")}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <Link
            key={i}
            href={c.href}
            className={`rounded-2xl border border-white/10 ${c.accent} bg-neutral-900 hover:bg-neutral-800 hover:scale-[1.02] transition-all duration-200 p-5 block`}
          >
            <div className="text-lg font-semibold">{c.title}</div>
            <div className="text-4xl font-bold mt-2">{c.kpi}</div>
            <div className="text-white/60 text-sm mt-1">{c.subtitle}</div>
            <div className="mt-3 inline-flex items-center gap-2 text-sm rounded px-3 py-1 bg-white text-black">
              {t("dashboard.go")} →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
