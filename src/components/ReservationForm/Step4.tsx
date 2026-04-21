"use client";

import React, { useEffect, useState } from "react";
import { PLACES } from "@/config/places";
import type { VehicleType } from "@/types";
import { makeReservationIcs, downloadIcs } from "@/utils/ics";
import { istToUtcMs } from "@/utils/time";
import { useI18nPublic } from "@/lib/i18n-public";
import {
  resolveServiceTypeDisplayName,
  resolveVariantDisplay,
  type ServiceTypeDisplayItem,
} from "@/lib/public/serviceDisplay";

function resolvePlaceKey(raw: string): string {
  const normalized = String(raw || "").trim().toLocaleLowerCase();
  const place = PLACES.find(
    (p) =>
      p.id.toLocaleLowerCase() === normalized ||
      p.label.toLocaleLowerCase() === normalized,
  );
  return place?.id ?? String(raw || "").trim();
}

type ReservationFormDataStep4 = {
  lang: "de" | "en" | "tr" | "ru";
  from: string;
  to: string;
  date?: string;
  time?: string;
  adults: number;
  babySeat: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicleType?: VehicleType;
  serviceTypeId?: string;
  serviceVariantKey?: string;
  price?: number | null;

  flightNo?: string;
  terminal?: string;
  baggageCount?: number;
  note?: string;
  acceptPolicy?: boolean;
  acceptKvkk?: boolean;
  acceptComms?: boolean;
};

type Step4Props = {
  updateData?: (patch: Partial<ReservationFormDataStep4>) => void;
  formData: ReservationFormDataStep4;
  prevStep: () => void;
  onSubmit?: () => Promise<void> | void;
  submitted?: boolean;
  pnr?: string | null;
  rid?: string | null;
};

export default function Step4({
  formData,
  prevStep,
  onSubmit,
  submitted,
  pnr,
  rid,
  updateData,
}: Step4Props) {
  const { t } = useI18nPublic();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean>(Boolean(submitted));

  // Server-fetched price quote
  const [quote, setQuote] = useState<{
    basePriceEur: number;
    variantSurcharge: number;
    totalPriceEur: number;
  } | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeDisplayItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/public/service-types")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => {
        if (cancelled) return;
        setServiceTypes((data?.items ?? []) as ServiceTypeDisplayItem[]);
      })
      .catch(() => {
        if (!cancelled) setServiceTypes([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const typeKey = formData.serviceTypeId || formData.vehicleType;
    if (!formData.from || !formData.to || !typeKey) {
      setQuote(null);
      return;
    }

    const fromKey = resolvePlaceKey(formData.from);
    const toKey = resolvePlaceKey(formData.to);
    let cancelled = false;

    const params = new URLSearchParams({
      from_key: fromKey,
      to_key: toKey,
      vehicle_type: typeKey,
    });
    if (formData.serviceVariantKey) {
      params.set("variant_key", formData.serviceVariantKey);
    }

    fetch(`/api/public/route-price?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setQuote(null);
          return;
        }
        setQuote({
          basePriceEur: data.basePriceEur,
          variantSurcharge: data.variantSurcharge ?? 0,
          totalPriceEur: data.totalPriceEur,
        });
        if (updateData && Number.isFinite(Number(data.totalPriceEur))) {
          updateData({ price: Number(data.totalPriceEur) });
        }
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      });

    return () => { cancelled = true; };
  }, [formData.from, formData.to, formData.vehicleType, formData.serviceTypeId, formData.serviceVariantKey]);

  const serviceTypeLabel = resolveServiceTypeDisplayName({
    lang: formData.lang,
    serviceTypeId: formData.serviceTypeId,
    vehicleType: formData.vehicleType,
    serviceTypes,
  });

  const variantLabel = resolveVariantDisplay({
    lang: formData.lang,
    serviceTypeId: formData.serviceTypeId || formData.vehicleType,
    serviceVariantKey: formData.serviceVariantKey,
    variantSurchargeEur: quote?.variantSurcharge,
    serviceTypes,
  });

  const missing =
    !formData.from || !formData.to || !formData.date || !formData.time ||
    !formData.firstName || !formData.lastName || !formData.phone || !formData.email;

  const babySeatWarning = Number(formData.babySeat) > 1;

  async function handleConfirm() {
    if (loading) return;

    if (onSubmit) {
      try {
        setErr(null);
        setLoading(true);
        await onSubmit();
        setOk(true);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setErr(null);
      setLoading(true);

      if (!formData.date || !formData.time) throw new Error(t("step1.datetime.placeholder"));

      const res = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: formData.from,
          to: formData.to,
          date: formData.date,
          time: formData.time,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          email: formData.email,
          lang: formData.lang,
          adults: Number.isFinite(Number(formData.adults)) ? Number(formData.adults) : 1,
          babySeat: Number.isFinite(Number(formData.babySeat)) ? Number(formData.babySeat) : 0,
          vehicleType: formData.vehicleType ?? undefined,
          serviceTypeId: formData.serviceTypeId ?? undefined,
          serviceVariantKey: formData.serviceVariantKey ?? undefined,
          flightNo: formData.flightNo,
          terminal: formData.terminal,
          baggageCount: formData.baggageCount,
          note: formData.note,
          acceptPolicy: true,
          acceptKvkk: true,
          acceptComms: !!formData.acceptComms,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "Server error");
      }

      setOk(true);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <div className="p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold text-green-500">{t("step4.success.title")}</h1>
        {rid && <div className="text-white/70">{t("step4.success.code")}: <span className="font-semibold">{rid}</span></div>}
        <p className="text-white/60">{t("step4.success.note")}</p>
        {(submitted && (pnr || rid)) && (
          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                try {
                  const code = pnr || rid || "";
                  const startAt = formData.date && formData.time
                    ? istToUtcMs(formData.date, formData.time)
                    : Date.now();
                  const res = {
                    id: rid || "",
                    code,
                    from: formData.from,
                    to: formData.to,
                    date: formData.date,
                    time: formData.time,
                    fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                    phone: formData.phone,
                    email: formData.email,
                    startAt,
                    status: "pending",
                    createdAt: Date.now(),
                    adults: formData.adults,
                    babySeat: formData.babySeat,
                    vehicleType: formData.vehicleType || undefined,
                  } as any;
                  const ics = makeReservationIcs(res);
                  downloadIcs(`${code || "reservation"}.ics`, ics);
                } catch {
                  alert("ICS dosyası oluşturulurken hata oluştu.");
                }
              }}
            >
              {t("public.addToCalendar")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("step4.title")}</h2>

      {err && <div className="rounded-md border border-red-600/40 bg-red-900/20 p-3 text-red-200">{err}</div>}
      {babySeatWarning && (
        <div className="rounded-md border border-yellow-600/40 bg-yellow-900/20 p-3 text-yellow-200">
          {t("step3.babySeat.warn")}
        </div>
      )}

      <div className="space-y-2 border border-white/10 rounded-md p-4">
        <Row label={t("step4.row.from")} value={formData.from} />
        <Row label={t("step4.row.to")} value={formData.to} />
        <Row label={t("step4.row.date")} value={formData.date ?? "—"} />
        <Row label={t("step4.row.time")} value={formData.time ?? "—"} />
        <Row label={t("step4.row.adults")} value={formData.adults} />
        <Row label={t("step4.row.babySeat")} value={formData.babySeat} />
        <Row label={t("step4.row.fullName")} value={`${formData.firstName} ${formData.lastName}`.trim()} />
        <Row label={t("step4.row.phone")} value={formData.phone} />
        <Row label={t("step4.row.email")} value={formData.email} />
        <Row label={t("step4.row.vehicle")} value={serviceTypeLabel ?? "—"} />
        {variantLabel && (
          <Row label={t("step4.row.variant")} value={variantLabel} />
        )}
        {quote ? (
          <>
            <Row label={t("step4.row.basePrice")} value={`€${quote.basePriceEur}`} />
            {quote.variantSurcharge > 0 && (
              <Row label={t("step4.row.surcharge")} value={`+€${quote.variantSurcharge}`} />
            )}
            <Row label={t("step4.row.quotedTotal")} value={`€${quote.totalPriceEur}`} highlight />
          </>
        ) : (
          <Row
            label={t("step4.row.price")}
            value={formData.price != null ? `€${formData.price}` : "—"}
          />
        )}
        <div className="pt-2 text-xs text-white/60 space-y-1">
          <p>{t("step4.quote.note")}</p>
          <p>{t("step4.payment.note")}</p>
        </div>
      </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <div>
    <label className="block text-sm text-white/70 mb-1">{t("step4.baggage")}</label>
    <input
      type="number"
      min={0}
      value={formData.baggageCount ?? 0}
      onChange={(e) => updateData && updateData({ baggageCount: Math.max(0, Number(e.target.value||0)) })}
      className="w-full rounded-md bg-neutral-900 border border-white/10 px-3 py-2"
    />
  </div>
  <div>
    <label className="block text-sm text-white/70 mb-1">{t("step1.flightNo")} / {t("step1.terminal")}</label>
    <div className="grid grid-cols-2 gap-2">
      <input
        type="text"
        value={formData.flightNo || ""}
        onChange={(e) => updateData && updateData({ flightNo: e.target.value.toUpperCase().trim() })}
        placeholder="XQ123"
        className="rounded-md bg-neutral-900 border border-white/10 px-3 py-2"
      />
      <select
        value={formData.terminal || ""}
        onChange={(e) => updateData && updateData({ terminal: e.target.value })}
        className="rounded-md bg-neutral-900 border border-white/10 px-3 py-2"
      >
        <option value="">-</option>
        <option value="T1">T1</option>
        <option value="T2">T2</option>
      </select>
    </div>
  </div>
</div>

<div>
  <label className="block text-sm text-white/70 mb-1">{t("step4.note")}</label>
  <textarea
    value={formData.note || ""}
    onChange={(e) => updateData && updateData({ note: e.target.value })}
    rows={3}
    className="w-full rounded-md bg-neutral-900 border border-white/10 px-3 py-2"
  />
</div>
<div className="space-y-2">
  <label className="flex items-start gap-2 text-sm">
    <input
      type="checkbox"
      checked={!!formData.acceptPolicy}
      onChange={(e) => updateData && updateData({ acceptPolicy: e.target.checked })}
    />
    <span>{t("step4.acceptPolicy")}</span>
  </label>
  <label className="flex items-start gap-2 text-sm">
    <input
      type="checkbox"
      checked={!!formData.acceptKvkk}
      onChange={(e) => updateData && updateData({ acceptKvkk: e.target.checked })}
    />
    <span>{t("step4.acceptKvkk")}</span>
  </label>
  <label className="flex items-start gap-2 text-sm">
    <input
      type="checkbox"
      checked={!!formData.acceptComms}
      onChange={(e) => updateData && updateData({ acceptComms: e.target.checked })}
    />
    <span>{t("step4.acceptComms")}</span>
  </label>
</div>
      <div className="flex items-center justify-between">
        <button onClick={prevStep} type="button" className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600">
          {t("step4.back")}
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || missing}
          className={`px-4 py-2 rounded ${
            loading || missing ? "bg-neutral-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? t("step4.sending") : t("step4.confirm")}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className={`flex justify-between border-b border-white/10 pb-2 ${highlight ? "font-bold text-green-400" : ""}`}>
      <span className="text-white/60">{label}:</span>
      <span className={highlight ? "font-bold" : "font-semibold"}>{String(value ?? "—")}</span>
    </div>
  );
}
