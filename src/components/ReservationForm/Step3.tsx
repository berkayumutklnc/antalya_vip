"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchVehicles } from "@/lib/vehicles";
import type { Vehicle, VehicleType } from "@/types";
import { istToUtcMs, addMinutes } from "@/utils/time";
import { useI18nPublic } from "@/lib/i18n-public";
import Image from "next/image";
import { VEHICLE_CATALOG } from "@/lib/vehicleCatalog";
const FEAT_ICON: Record<string, string> = {
  wifi: "📶",
  usb: "🔌",
  ac: "❄️",
  water: "💧",
  luggage: "🧳",
};

type FormShape = {
  lang: "de" | "en" | "tr" | "ru";
  from: string;
  to: string;
  date?: string;
  time?: string; 
  adults: number;
  babySeat: number;
  phone: string;
  email: string;
  vehicleType?: VehicleType;
  price?: number | null;
};

type Props = {
  formData: FormShape;
  updateData?: (patch: Partial<FormShape>) => void;
  setFormDataProp?: (patch: Partial<FormShape>) => void;
  prevStep: () => void;
  nextStep: () => void;
};

const SLOT_MIN = 60;
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function isVehicleFreeLocal(v: Vehicle, startAt: number, endAt: number): boolean {
  const slots = Array.isArray((v as any).blockedSlots) ? (v as any).blockedSlots : [];
  return !slots.some((s: any) => {
    const a = Number(s?.startAt ?? 0);
    const b = Number(s?.endAt ?? 0);
    const A = a > 0 && a < 1e12 ? a * 1000 : a; 
    const B = b > 0 && b < 1e12 ? b * 1000 : b;
    return A < endAt && startAt < B; 
  });
}

export default function Step3({
  formData,
  updateData,
  setFormDataProp,
  prevStep,
  nextStep,
}: Props) {
  const { t } = useI18nPublic();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<VehicleType | null>(formData.vehicleType ?? null);

  const patchForm = (patch: Partial<FormShape>) => {
    if (updateData) updateData(patch);
    else if (setFormDataProp) setFormDataProp(patch);
  };

  const setAdults = (n: number) => patchForm({ adults: clamp(n, 1, 8) });
  const setBaby = (n: number) => patchForm({ babySeat: clamp(n, 0, 3) });

  const babySeatWarning = Number(formData.babySeat) > 1;

  const dateTimeReady = Boolean(formData.date && formData.time);
  const startAt = useMemo(
    () => (dateTimeReady ? istToUtcMs(formData.date!, formData.time!) : 0),
    [dateTimeReady, formData.date, formData.time]
  );
  const endAt = useMemo(() => (startAt ? addMinutes(startAt, SLOT_MIN) : 0), [startAt]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const list = await fetchVehicles();
        setVehicles(list);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const availabilityByType: Record<VehicleType, boolean> = useMemo(() => {
    const map: Record<VehicleType, boolean> = { "vip-6": true, "vip-10": true } as any;
    if (!startAt || !endAt) return map;
    for (const v of vehicles) {
      const free = isVehicleFreeLocal(v, startAt, endAt);
      const tp = v.type as VehicleType;
      if (map[tp] == null) map[tp] = free;
      else map[tp] = map[tp] || free; 
    }
    return map;
  }, [vehicles, startAt, endAt]);

  function choose(tkey: VehicleType) {
    setSelected(tkey);
    patchForm({ vehicleType: tkey });
  }

  const canContinue = dateTimeReady && !!selected;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("step3.title")}</h2>

      {babySeatWarning && (
        <div className="rounded-md border border-yellow-600/40 bg-yellow-900/20 p-3 text-yellow-200">
          {t("step3.babySeat.warn")}
        </div>
      )}

      {!dateTimeReady && (
        <div className="rounded-md border border-yellow-600/40 bg-yellow-900/20 p-3 text-yellow-200">
          {t("step3.pickDateFirst")}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-white/10 p-4">
          <label className="block text-sm font-medium mb-2">{t("step3.adults")}</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdults((formData.adults || 1) - 1)}
              className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
              aria-label="dec-adults"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={8}
              value={formData.adults}
              onChange={(e) => setAdults(parseInt(e.target.value || "1", 10))}
              className="w-20 rounded border border-white/15 bg-black px-3 py-2 text-center"
            />
            <button
              type="button"
              onClick={() => setAdults((formData.adults || 1) + 1)}
              className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
              aria-label="inc-adults"
            >
              +
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 p-4">
          <label className="block text-sm font-medium mb-2">{t("step3.babySeat")}</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBaby((formData.babySeat || 0) - 1)}
              className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
              aria-label="dec-baby"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              max={3}
              value={formData.babySeat}
              onChange={(e) => setBaby(parseInt(e.target.value || "0", 10))}
              className="w-20 rounded border border-white/15 bg-black px-3 py-2 text-center"
            />
            <button
              type="button"
              onClick={() => setBaby((formData.babySeat || 0) + 1)}
              className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
              aria-label="inc-baby"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div>{t("step3.loading")}</div>
      ) : err ? (
        <div className="text-red-400">{t("step3.error")}: {err}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["vip-6", "vip-10"] as VehicleType[]).map((tkey) => {
            const cat = VEHICLE_CATALOG[tkey];
            const available = availabilityByType[tkey];
            const active = selected === tkey;

            return (
              <button
                key={tkey}
                type="button"
                onClick={() => choose(tkey)}
                disabled={!available || !dateTimeReady}
                className={[ 
                  "text-left rounded-lg border p-0 overflow-hidden transition",
                  active ? "border-blue-500 ring-2 ring-blue-500/40 bg-white/5" : "border-white/10 hover:border-white/20",
                  !available || !dateTimeReady ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {cat?.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    width={800}
                    height={450}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="h-36 w-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
                )}

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">
                      {cat?.title || "VIP"} ({t("fleet.seats", { n: cat?.capacity ?? (tkey === "vip-6" ? 6 : 10) })})
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${available ? "bg-emerald-900/40 text-emerald-300" : "bg-red-900/40 text-red-300"}`}>
                      {available ? t("step3.available") : t("step3.unavailable")}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(cat?.features || []).map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80"
                        title={t(`feature.${f}`)}
                      >
                        <span>{FEAT_ICON[f] || "•"}</span>
                        <span>{t(`feature.${f}`)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button type="button" onClick={prevStep} className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700">
          {t("step3.back")}
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!canContinue}
          className={`px-4 py-2 rounded ${canContinue ? "bg-blue-600 hover:bg-blue-700" : "bg-neutral-700 cursor-not-allowed"}`}
        >
          {t("step3.next")}
        </button>
      </div>
    </div>
  );
}
