"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listReservations } from "@/lib/reservations";
import { fetchVehicles } from "@/lib/vehicles";
import type { Reservation, Vehicle } from "@/types";
import { useI18n } from "@/lib/i18n-admin";

export default function AdminHomePage() {
  const { t } = useI18n();
  const [pending, setPending] = useState<number>(0);
  const [vehicles, setVehicles] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rs, vs] = await Promise.all([listReservations(), fetchVehicles()]);
        if (!mounted) return;
        setPending(rs.filter(r => r.status === "pending").length);
        setVehicles(vs.length);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const cards = [
    { href: "/admin/reservations", title: t("nav.reservations"), kpi: `${pending}`, subtitle: t("dashboard.openReservations") },
    { href: "/admin/vehicles", title: t("nav.vehicles"), kpi: `${vehicles}`, subtitle: t("dashboard.vehicles") },
    { href: "/admin/calendar", title: t("nav.calendar"), kpi: "D", subtitle: "Day view" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <div className="text-white/60">{t("dashboard.subtitle")}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-white/10 bg-neutral-900 hover:bg-neutral-800 transition p-4 block"
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
