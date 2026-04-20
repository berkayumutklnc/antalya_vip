"use client";

import AdminGate from "@/components/AdminGate";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export default function ResetToolsPage() {
  return (
    <AdminGate>
      <DangerZoneInner />
    </AdminGate>
  );
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
}

function DangerZoneInner() {
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [includeLegacyVip6, setIncludeLegacyVip6] = useState(false);

  const push = (m: string) => setLog((xs) => [m, ...xs]);

  async function purgeReservationsAndPNR() {
    setBusy(true);
    try {
      push("reservations siliniyor…");
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/tools/reset", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "purge_reservations" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      push(`reservations: ${data.deleted ?? 0} kayıt silindi.`);
    } catch (e: any) {
      push("Hata (purge): " + (e?.message ?? String(e)));
    } finally {
      setBusy(false);
    }
  }

  async function resetVehicleBlocks() {
    setBusy(true);
    try {
      push("vehicle blokları sıfırlanıyor…");
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/tools/reset", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "reset_vehicle_blocks" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      push(`blocked_slots: ${data.deleted ?? 0} kayıt silindi.`);
    } catch (e: any) {
      push("Hata (vehicles): " + (e?.message ?? String(e)));
    } finally {
      setBusy(false);
    }
  }

  async function seedVehicles() {
    setBusy(true);
    try {
      push("demo araçlar oluşturuluyor…");
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/tools/reset", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "seed_vehicles", includeLegacyVip6 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      push(`seed: ${data.created ?? 0} araç oluşturuldu.${data.legacyVip6Included ? " (legacy vip-6 dahil)" : ""}`);
    } catch (e: any) {
      push("Hata (seed): " + (e?.message ?? String(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-red-400">Admin • Danger Zone</h1>
      <p className="text-white/60">Bu işlemler geri alınamaz. Gerekirse önce yedek al.</p>

      <div className="grid gap-4">
        <ActionCard
          title="Reservations + PNR Temizle"
          desc="Tüm rezervasyon kayıtlarını ve PNR mapping’lerini siler."
          onClick={purgeReservationsAndPNR}
          disabled={busy}
          tone="danger"
        />
        <ActionCard
          title="Vehicles Bloklarını Sıfırla"
          desc="Tüm araçların blockedSlots alanını boşlar (araçlar silinmez)."
          onClick={resetVehicleBlocks}
          disabled={busy}
        />
        <ActionCard
          title="Demo Araçları Seed Et"
          desc="Varsayılan olarak sadece ticari teklif araçlarını (vip-10, vip-16) oluşturur."
          onClick={seedVehicles}
          disabled={busy}
        />
        <label className="flex items-center gap-2 rounded-lg border border-white/10 p-3 text-sm">
          <input
            type="checkbox"
            checked={includeLegacyVip6}
            onChange={(e) => setIncludeLegacyVip6(e.target.checked)}
          />
          Legacy vip-6 araçlarını da seed et (yalnızca geçmiş veri uyumluluğu için)
        </label>
      </div>

      <div className="rounded border border-white/10 p-3">
        <div className="text-sm font-semibold mb-2">Log</div>
        <div className="space-y-1 text-xs text-white/70">
          {log.length === 0 ? <div>—</div> : log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </main>
  );
}

function ActionCard({
  title,
  desc,
  onClick,
  disabled,
  tone,
}: {
  title: string;
  desc: string;
  onClick: () => Promise<void> | void;
  disabled?: boolean;
  tone?: "danger" | "normal";
}) {
  return (
    <div className="rounded-lg border border-white/10 p-4 space-y-2">
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-white/60 text-sm">{desc}</div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded ${
          disabled
            ? "bg-neutral-700 cursor-not-allowed"
            : tone === "danger"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        Çalıştır
      </button>
    </div>
  );
}
