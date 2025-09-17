"use client";

import { useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";

function toMs(s: unknown): number | null {
  if (typeof s === "string") {
    const t = Date.parse(s);
    return Number.isFinite(t) ? t : null;
  }
  return null;
}

export default function MigrateBlockedSlotsPage() {
  const [log, setLog] = useState<string>("");

  const run = async () => {
    try {
      setLog("Scanning vehicles...");
      const snap = await getDocs(collection(getClientDb(), "vehicles"));

      for (const d of snap.docs) {
        const v = d.data() as any;
        const bs = v?.blockedSlots;
        if (Array.isArray(bs) && bs.length > 0 && typeof bs[0] === "string") {
          const arr = (bs as string[])
            .map((iso) => {
              const startAt = toMs(iso);
              if (!startAt) return null;
              return {
                startAt,
                endAt: startAt + 60 * 60 * 1000, 
                reason: "manual-block",
              };
            })
            .filter(Boolean);

          await updateDoc(doc(getClientDb(), "vehicles", d.id), {
            blockedSlots: arr,
            updatedAt: Date.now(),
          });

          setLog((p) => p + `\n${d.id}: converted ${(arr as any[]).length} slots`);
        } else {
          setLog((p) => p + `\n${d.id}: skipped (already migrated or empty)`);
        }
      }

      setLog((p) => p + `\nDONE`);
    } catch (e: any) {
      setLog((p) => p + `\nERROR: ${e?.message ?? String(e)}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-3">Migrate blockedSlots → ms</h1>

      <button
        onClick={run}
        className="px-4 py-2 rounded bg-black text-white"
      >
        Run Migration
      </button>

      <pre className="mt-4 whitespace-pre-wrap text-sm">{log}</pre>
    </div>
  );
}
