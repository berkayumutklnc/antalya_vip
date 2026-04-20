"use client";

import { useEffect, useMemo, useState } from "react";
import type { VehicleType } from "@/types";
import { useI18nPublic } from "@/lib/i18n-public";
import Image from "next/image";
import { getPublicBookableServiceTypes } from "@/lib/public/serviceCatalog";

const FEAT_ICON: Record<string, string> = {
  wifi: "📶",
  usb: "🔌",
  ac: "❄️",
  water: "💧",
  luggage: "🧳",
};

type ServiceTypeItem = {
  id: string;
  slug: string;
  nameDe: string;
  nameEn: string;
  nameTr: string;
  nameRu: string;
  capacity: number;
  image: string;
  features: string[];
  variants: {
    key: string;
    nameDe: string;
    nameEn: string;
    nameTr: string;
    nameRu: string;
    priceModifierEur: number;
    sortOrder: number;
  }[];
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
  serviceTypeId?: string;
  serviceVariantKey?: string;
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

function getName(item: { nameDe: string; nameEn: string; nameTr: string; nameRu: string }, lang: string): string {
  switch (lang) {
    case "tr": return item.nameTr;
    case "en": return item.nameEn;
    case "de": return item.nameDe;
    case "ru": return item.nameRu;
    default: return item.nameEn;
  }
}

export default function Step3({
  formData,
  updateData,
  setFormDataProp,
  prevStep,
  nextStep,
}: Props) {
  const { t } = useI18nPublic();
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeItem[]>([]);
  const [availabilityByType, setAvailabilityByType] = useState<Record<string, boolean>>({});
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(formData.serviceTypeId ?? formData.vehicleType ?? null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(formData.serviceVariantKey ?? null);

  const patchForm = (patch: Partial<FormShape>) => {
    if (updateData) updateData(patch);
    else if (setFormDataProp) setFormDataProp(patch);
  };

  const setAdults = (n: number) => patchForm({ adults: clamp(n, 1, 8) });
  const setBaby = (n: number) => patchForm({ babySeat: clamp(n, 0, 3) });

  const babySeatWarning = Number(formData.babySeat) > 1;
  const dateTimeReady = Boolean(formData.date && formData.time);

  // Fetch service types from DB
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingTypes(true);
      try {
        const res = await fetch("/api/public/service-types");
        if (!res.ok) throw new Error("Failed to load service types");
        const data = await res.json();
        if (!cancelled) setServiceTypes(getPublicBookableServiceTypes(data.items ?? []));
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? String(e));
      } finally {
        if (!cancelled) setLoadingTypes(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Check availability
  useEffect(() => {
    if (!dateTimeReady) return;
    let cancelled = false;
    (async () => {
      setLoadingAvail(true);
      setErr(null);
      try {
        const params = new URLSearchParams({
          date: formData.date!,
          time: formData.time!,
          slotMinutes: String(SLOT_MIN),
        });
        const res = await fetch(`/api/public/vehicles/availability?${params}`);
        if (!res.ok) throw new Error("Availability check failed");
        const data = await res.json();
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        for (const entry of data.types || []) {
          map[entry.type as string] = entry.available;
        }
        setAvailabilityByType(map);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? String(e));
      } finally {
        if (!cancelled) setLoadingAvail(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dateTimeReady, formData.date, formData.time]);

  const selectedTypeObj = useMemo(
    () => serviceTypes.find((st) => st.id === selectedType) ?? null,
    [serviceTypes, selectedType],
  );

  function chooseType(typeId: string) {
    setSelectedType(typeId);
    const st = serviceTypes.find((s) => s.id === typeId);
    // Auto-select first variant if only one, or "standard" if available
    const variants = st?.variants ?? [];
    let autoVariant: string | null = null;
    if (variants.length === 1) {
      autoVariant = variants[0].key;
    } else if (variants.length > 1) {
      const std = variants.find((v) => v.key === "standard");
      autoVariant = std ? "standard" : null;
    }
    setSelectedVariant(autoVariant);
    patchForm({
      vehicleType: typeId as VehicleType,
      serviceTypeId: typeId,
      serviceVariantKey: autoVariant ?? undefined,
    });
  }

  function chooseVariant(variantKey: string) {
    setSelectedVariant(variantKey);
    patchForm({ serviceVariantKey: variantKey });
  }

  const loading = loadingTypes || loadingAvail;
  const canContinue = dateTimeReady && !!selectedType && !!selectedVariant;

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
        <>
          {/* Service type cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceTypes.map((st) => {
              const available = availabilityByType[st.id] !== false;
              const active = selectedType === st.id;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => chooseType(st.id)}
                  disabled={!available || !dateTimeReady}
                  className={[
                    "text-left rounded-lg border p-0 overflow-hidden transition",
                    active ? "border-blue-500 ring-2 ring-blue-500/40 bg-white/5" : "border-white/10 hover:border-white/20",
                    !available || !dateTimeReady ? "opacity-50 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {st.image ? (
                    <Image
                      src={st.image}
                      alt={getName(st, formData.lang)}
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
                        {getName(st, formData.lang)} ({t("fleet.seats", { n: st.capacity })})
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${available ? "bg-emerald-900/40 text-emerald-300" : "bg-red-900/40 text-red-300"}`}>
                        {available ? t("step3.available") : t("step3.unavailable")}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(st.features || []).map((f) => (
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

          {/* Variant selection */}
          {selectedTypeObj && selectedTypeObj.variants.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">{t("step3.variant")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTypeObj.variants.map((v) => {
                  const active = selectedVariant === v.key;
                  return (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => chooseVariant(v.key)}
                      className={[
                        "text-left rounded-lg border p-4 transition",
                        active ? "border-blue-500 ring-2 ring-blue-500/40 bg-white/5" : "border-white/10 hover:border-white/20",
                      ].join(" ")}
                    >
                      <div className="font-semibold">{getName(v, formData.lang)}</div>
                      {v.priceModifierEur > 0 && (
                        <div className="text-sm text-green-400 mt-1">+€{v.priceModifierEur}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
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
