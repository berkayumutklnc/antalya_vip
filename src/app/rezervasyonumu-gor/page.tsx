"use client";

import { useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addMinutes } from "@/utils/time";
import { makeReservationIcs, downloadIcs } from "@/utils/ics";
import { requestCancel } from "@/lib/reservations";
import { I18nPublicProvider, useI18nPublic } from "@/lib/i18n-public";
import LanguageSwitchPublic from "@/components/public/LanguageSwitchPublic";

function resolveStartAtMs(rec: { startAt?: any; date: string; time: string }) {
  const n = Number(rec.startAt);
  if (Number.isFinite(n) && n > 0) {
    return n < 1e12 ? n * 1000 : n;
  }
  const [y, m, d] = (rec.date || "").split("-").map(Number);
  const [H, M] = (rec.time || "00:00").split(":").map(Number);
  return Date.UTC(y || 1970, (m || 1) - 1, d || 1, H || 0, M || 0);
}

type Resv = {
  id: string;
  code?: string | null;
  email: string;
  fullName: string;
  phone: string;
  from: string;
  to: string;
  date: string;
  time: string;
  startAt?: number | null;
  status: "pending" | "confirmed" | "canceled";
  vehicleType?: string | null;
  plate?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  price?: number | null;
  createdAt?: number;
  cancel?: {
    requested: boolean;
    reason: string | null;
    requestedAt: number | null;
    canceledAt: number | null;
  } | null;
};

function PageInner() {
  const { t } = useI18nPublic();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [rec, setRec] = useState<Resv | null>(null);

  const [cancelReason, setCancelReason] = useState("");
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);

  async function onSearch() {
    setErr(null);
    setRec(null);
    setCancelMsg(null);

    const normCode = code.trim().toUpperCase();
    const normMail = email.trim().toLowerCase();
    if (!/^TRF-\w{3,}$/.test(normCode) || !normMail) {
      setErr(t("public.error.input"));
      return;
    }

    setLoading(true);
    try {
      const ref = doc(db, "reservations", normCode);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setErr(t("public.error.notfound"));
        return;
      }
      const d = snap.data() as any;
      const mail = String(d.email || "").toLowerCase();
      if (mail !== normMail) {
        setErr(t("public.error.notfound"));
        return;
      }
      setRec({ id: snap.id, ...(d as any) });
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  const startAt = rec ? resolveStartAtMs(rec) : 0;
  const endAt = startAt ? addMinutes(startAt, 60) : 0;

  const canCancel = useMemo(() => {
    if (!rec || !startAt) return false;
    const now = Date.now();
    return startAt - now >= 12 * 60 * 60 * 1000;
  }, [rec, startAt]);

  async function onRequestCancel() {
    if (!rec) return;
    setCancelMsg(null);
    setErr(null);

    if (!canCancel) {
      setCancelMsg(t("public.cancel.tooLate"));
      return;
    }

    setCancelBusy(true);
    try {
      await requestCancel(rec.id, cancelReason.trim());
      setCancelMsg(t("public.cancel.sent"));
      setRec((prev) =>
        prev
          ? {
              ...prev,
              cancel: {
                requested: true,
                reason: cancelReason.trim() || null,
                requestedAt: Date.now(),
                canceledAt: null,
              },
            }
          : prev
      );
      setCancelReason("");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setCancelBusy(false);
    }
  }

  function onDownloadIcs() {
    if (!rec || !startAt) return;
    const res = {
      id: rec.id,
      code: rec.code || rec.id,
      from: rec.from,
      to: rec.to,
      date: rec.date,
      time: rec.time,
      startAt,
      fullName: rec.fullName,
      phone: rec.phone,
      email: rec.email,
      status: rec.status,
      adults: (rec as any).adults ?? undefined,
      babySeat: (rec as any).babySeat ?? undefined,
      vehicleType: rec.vehicleType ?? undefined,
    } as any;
    const ics = makeReservationIcs(res);
    downloadIcs(`${res.code || "reservation"}.ics`, ics);
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("public.title")}</h1>
        <LanguageSwitchPublic />
      </div>

      <div className="rounded-lg border border-white/10 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("public.code.placeholder")}
            className="rounded bg-neutral-900 border border-white/10 p-2"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("public.email.placeholder")}
            className="rounded bg-neutral-900 border border-white/10 p-2"
          />
        </div>
        <button
          onClick={onSearch}
          disabled={loading}
          className={`px-4 py-2 rounded ${loading ? "bg-neutral-700" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? t("public.loading") : t("public.search")}
        </button>
        {err && <div className="text-red-400 text-sm">{err}</div>}
      </div>

      {rec && (
        <div className="rounded-lg border border-white/10 p-4 space-y-3">
          <Row k="Kod" v={/^TRF-/.test(rec.id) ? rec.id : rec.code ?? rec.id} />
          <Row k="Durum" v={rec.status} />
          <Row k="Tarih" v={`${rec.date} ${rec.time}`} />
          <Row k="Rota" v={`${rec.from} → ${rec.to}`} />
          <Row k="Yolcu" v={`${rec.fullName} (${rec.phone})`} />
          <Row k="E-posta" v={rec.email} />
          <Row k="Araç" v={rec.vehicleType ?? "—"} />
          <Row k="Plaka" v={rec.plate ?? "—"} />
          <Row k="Şoför" v={`${rec.driverName ?? "—"} (${rec.driverPhone ?? "—"})`} />

          {startAt > 0 && endAt > 0 && (
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onDownloadIcs}
                className="inline-block rounded bg-emerald-600 hover:bg-emerald-700 px-4 py-2"
              >
                {t("public.addToCalendar")}
              </button>
              <div className="text-xs text-white/40">
                Başlangıç: {new Date(startAt).toLocaleString()}
              </div>
            </div>
          )}

          <div className="mt-4 rounded border border-white/10 p-3 space-y-2">
            <div className="font-semibold">{t("public.cancel.title")}</div>
            {rec.cancel?.requested ? (
              <div className="text-white/60 text-sm">
                {t("public.cancel.sent")}
              </div>
            ) : startAt && !canCancel ? (
              <div className="text-white/60 text-sm">
                {t("public.cancel.tooLate")}
              </div>
            ) : rec.status === "canceled" ? (
              <div className="text-white/60 text-sm">Rezervasyon zaten iptal edilmiş.</div>
            ) : (
              <>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={t("public.cancel.reason.placeholder")}
                  className="w-full rounded bg-neutral-900 border border-white/10 p-2"
                />
                <button
                  onClick={onRequestCancel}
                  disabled={cancelBusy}
                  className={`px-4 py-2 rounded ${cancelBusy ? "bg-neutral-700" : "bg-red-600 hover:bg-red-700"}`}
                >
                  {cancelBusy ? t("public.loading") : t("public.cancel.submit")}
                </button>
                {cancelMsg && <div className="text-white/70 text-sm">{cancelMsg}</div>}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex justify-between border-b border-white/10 py-1">
      <span className="text-white/60">{k}</span>
      <span className="font-medium">{String(v ?? "—")}</span>
    </div>
  );
}

export default function RezvSorguPage() {
  return (
    <I18nPublicProvider>
      <PageInner />
    </I18nPublicProvider>
  );
}
