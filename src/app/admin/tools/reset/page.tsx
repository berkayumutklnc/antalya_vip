"use client";
export const dynamic = "force-dynamic";

import AdminGate from "@/components/AdminGate";
import { useState } from "react";
import {
  collection,
  getDocs,
  writeBatch,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import type { Vehicle } from "@/types";

export default function ResetToolsPage() {
  return (
    <AdminGate>
      <DangerZoneInner />
    </AdminGate>
  );
}

function DangerZoneInner() {
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const push = (m: string) => setLog((xs) => [m, ...xs]);

  async function deleteCollectionBatched(colName: string, chunk = 400) {
    const snap = await getDocs(collection(getClientDb(), colName));
    const refs = snap.docs.map((d) => d.ref);
    let deleted = 0;

    for (let i = 0; i < refs.length; i += chunk) {
      const batch = writeBatch(getClientDb());
      refs.slice(i, i + chunk).forEach((r) => batch.delete(r));
      await batch.commit();
      deleted += Math.min(chunk, refs.length - i);
    }
    return deleted;
  }

  async function purgeReservationsAndPNR() {
    setBusy(true);
    try {
      push("reservations siliniyor…");
      const delRes = await deleteCollectionBatched("reservations");
      push(`reservations: ${delRes} doküman silindi.`);

      push("pnr siliniyor…");
      const delPnr = await deleteCollectionBatched("pnr");
      push(`pnr: ${delPnr} doküman silindi.`);
    } catch (e: any) {
      push("Hata (purge): " + (e?.message ?? String(e)));
    } finally {
      setBusy(false);
    }
  }

  async function resetVehicleBlocks() {
    setBusy(true);
    try {
      const vsnap = await getDocs(collection(getClientDb(), "vehicles"));
      const refs = vsnap.docs.map((d) => d.ref);
      let updated = 0;

      for (let i = 0; i < refs.length; i += 400) {
        const batch = writeBatch(getClientDb());
        refs.slice(i, i + 400).forEach((r) =>
          batch.update(r, { blockedSlots: [], updatedAt: Date.now() })
        );
        await batch.commit();
        updated += Math.min(400, refs.length - i);
      }
      push(`vehicles: ${updated} dokümanda blockedSlots sıfırlandı.`);
    } catch (e: any) {
      push("Hata (vehicles): " + (e?.message ?? String(e)));
    } finally {
      setBusy(false);
    }
  }

  async function seedVehicles() {
    setBusy(true);
    try {
      const now = Date.now();
      const seed: Vehicle[] = [
        {
          id: "VIP6-01",
          type: "vip-6",
          plate: "07 VIP 001",
          driverName: "Ali Genç",
          driverPhone: "+905550000001",
          blockedSlots: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "VIP6-02",
          type: "vip-6",
          plate: "34 TL 5416",
          driverName: "Berkay Umut KILINÇ",
          driverPhone: "+905550000002",
          blockedSlots: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "VIP10-01",
          type: "vip-10",
          plate: "07 ABC 101",
          driverName: "Mehmet Kaya",
          driverPhone: "+905550000003",
          blockedSlots: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "VIP-16-01",
          type: "vip-16",
          plate: "07 ABC 101",
          driverName: "Mehmet Kaya",
          driverPhone: "+905550000003",
          blockedSlots: [],
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const v of seed) {
        await setDoc(doc(getClientDb(), "vehicles", v.id), v, { merge: true });
      }
      push(`seed: ${seed.length} araç yazıldı/merge edildi.`);
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
          desc="3 örnek aracı merge eder."
          onClick={seedVehicles}
          disabled={busy}
        />
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
