"use client";
export const dynamic = 'force-dynamic';
import AdminGate from "@/components/AdminGate";
import { useEffect, useMemo, useState } from "react";
import { listReservations, assignVehicle, approveCancel, rejectCancel } from "@/lib/reservations";
import { fetchVehicles } from "@/lib/vehicles";
import type { Reservation, Vehicle } from "@/types";
import { waLink } from "@/utils/links";
import StatusBadge from "@/components/admin/StatusBadge";
import AssignVehicleModal from "@/components/admin/AssignVehicleModal";
import CancelRequestModal from "@/components/admin/CancelRequestModal";
type Tab = "all" | "pending" | "confirmed" | "canceled";

function msgForCustomer(r: Reservation) {
  const code = r.code || r.id;
  return `Sayın ${r.fullName}, ${r.date} ${r.time} ${r.from} → ${r.to} transferiniz ONAYLANDI. Şoför: ${r.driverName || "-"} ${r.driverPhone || ""}. Kod: ${code}.`;
}
function msgForDriver(r: Reservation) {
  const code = r.code || r.id;
  return `Merhaba ${r.driverName || ""}, ${r.date} ${r.time} ${r.from} → ${r.to} transfer atandı. Misafir: ${r.fullName} (${r.phone}). Kod: ${code}.`;
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignFor, setAssignFor] = useState<Reservation | null>(null);
  const [cancelFor, setCancelFor] = useState<Reservation | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [rs, vs] = await Promise.all([listReservations(), fetchVehicles()]);
    setReservations(rs);
    setVehicles(vs);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let rows = reservations;
    if (tab !== "all") rows = rows.filter((r) => r.status === tab);
    if (s) {
      rows = rows.filter(
        (r) =>
          (r.code || r.id).toLowerCase().includes(s) ||
          (r.fullName || "").toLowerCase().includes(s) ||
          (r.phone || "").toLowerCase().includes(s) ||
          (r.email || "").toLowerCase().includes(s) ||
          r.from.toLowerCase().includes(s) ||
          r.to.toLowerCase().includes(s)
      );
    }
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  }, [reservations, tab, q]);

  function downloadCsv(filename: string, rows: any[]) {
    if (!rows || rows.length === 0) {
      alert("İndirilecek veri yok.");
      return;
    }
    const headers = Object.keys(rows[0]);
    const escape = (v: any) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    };
    const lines = [headers.join(",")].concat(
      rows.map((r) => headers.map((h) => escape((r as any)[h])).join(","))
    );
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : filename + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminGate>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Rezervasyonlar</h1>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ara: kod, isim, telefon..."
              className="px-3 py-2 rounded bg-neutral-800 border border-white/10"
            />
            <button
              className="px-3 py-2 rounded bg-gray-200 text-black hover:bg-gray-300"
              onClick={() => {
                try {
                  const rows = filtered.map((r) => ({
                    id: r.id,
                    code: r.code || "",
                    status: r.status,
                    from: r.from,
                    to: r.to,
                    date: r.date,
                    time: r.time,
                    fullName: r.fullName,
                    phone: r.phone,
                    email: r.email,
                    vehicleType: r.vehicleType || "",
                    vehicleId: (r as any).vehicleId || "",
                    driverName: (r as any).driverName || "",
                    driverPhone: (r as any).driverPhone || "",
                    price: (r as any).price ?? "",
                    cancelRequested: r.cancel?.requested ?? false,
                    cancelReason: r.cancel?.reason ?? "",
                  }));
                  downloadCsv(`reservations_${new Date().toISOString().slice(0, 10)}`, rows);
                } catch (e) {
                  console.error(e);
                  alert("CSV oluşturulamadı.");
                }
              }}
            >
              CSV indir
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {([["all","Tümü"],["pending","Bekleyen"],["confirmed","Onaylı"],["canceled","İptal"]] as [Tab,string][])
            .map(([key,label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded border ${tab===key ? "bg-white text-black border-white" : "bg-neutral-900 border-white/10 text-white/80 hover:bg-neutral-800"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {error && <div className="rounded border border-red-600/40 bg-red-900/20 p-3 text-red-200">{error}</div>}

        {loading ? (
          <div className="text-white/60">Yükleniyor...</div>
        ) : (
          <div className="rounded border border-white/10 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-800/60">
                <tr>
                  <th className="text-left p-2">Kod</th>
                  <th className="text-left p-2">Tarih/Saat</th>
                  <th className="text-left p-2">Rota</th>
                  <th className="text-left p-2">Müşteri</th>
                  <th className="text-left p-2">Araç</th>
                  <th className="text-left p-2">Durum</th>
                  <th className="text-right p-2">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const dPhone = (r as any).driverPhone as string | undefined;
                  const hasCustWA = Boolean(r.phone);
                  const hasDrWA = Boolean(dPhone);

                  return (
                    <tr key={r.id} className="border-t border-white/5">
                      <td className="p-2">
                        <div className="font-medium">{r.code || r.id}</div>
                        <div className="text-xs text-white/50">{new Date(r.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="p-2">{r.date} {r.time}</td>
                      <td className="p-2">
                        <div>{r.from} → {r.to}</div>
                        <div className="text-xs text-white/50">Kişi: {r.adults} • Bebek: {r.babySeat}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{r.fullName || "—"}</div>
                        <div className="text-xs text-white/50">{r.phone} • {r.email}</div>
                      </td>
                      <td className="p-2">
                        <div>{r.vehicleType || "—"} {r.plate ? `• ${r.plate}` : ""}</div>
                        <div className="text-xs text-white/50">{(r as any).driverName || ""} {(r as any).driverPhone ? `• ${(r as any).driverPhone}` : ""}</div>
                      </td>
                      <td className="p-2">
                        <StatusBadge status={r.status} />
                        {r.cancel?.requested && (
                          <span className="ml-2 px-2 py-0.5 rounded border text-xs font-medium bg-yellow-900/30 text-yellow-300 border-yellow-700/40">
                            İptal Talebi
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex gap-2 justify-end">
                          {r.status === "pending" && !r.cancel?.requested && (
                            <button
                              className="px-3 py-1 rounded bg-green-700 hover:bg-green-800"
                              onClick={() => setAssignFor(r)}
                            >
                              Araç Ata
                            </button>
                          )}
                          {r.status === "pending" && (
                            <a
                              className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-800"
                              href={waLink(r.phone, `Sayın ${r.fullName}, ${r.date} ${r.time} ${r.from} → ${r.to} rezervasyonunuzla ilgili bilgi için yazıyoruz.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              WA Müşteri
                            </a>
                          )}

                          {r.status === "confirmed" && (
                            <>
                              <a
                                className={`px-3 py-1 rounded ${hasCustWA ? "bg-emerald-700 hover:bg-emerald-800" : "bg-neutral-700 text-white/60 cursor-not-allowed"}`}
                                href={hasCustWA ? waLink(r.phone!, msgForCustomer(r)) : undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => { if (!hasCustWA) e.preventDefault(); }}
                              >
                                WA Müşteri
                              </a>
                              <a
                                className={`px-3 py-1 rounded ${hasDrWA ? "bg-teal-700 hover:bg-teal-800" : "bg-neutral-700 text-white/60 cursor-not-allowed"}`}
                                href={hasDrWA ? waLink(dPhone!, msgForDriver(r)) : undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => { if (!hasDrWA) e.preventDefault(); }}
                              >
                                WA Şoför
                              </a>
                            </>
                          )}
                          {r.cancel?.requested && (
                            <button
                              className="px-3 py-1 rounded bg-neutral-800 border border-white/10"
                              onClick={() => setCancelFor(r)}
                            >
                              Sebebi Gör
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-4 text-center text-white/60">Kayıt bulunamadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {assignFor && (
          <AssignVehicleModal
            open={true}
            onClose={() => setAssignFor(null)}
            reservation={assignFor as any}
            vehicles={vehicles}
            onAssign={async (v) => {
              await assignVehicle(assignFor.id, v);
              await refresh();
            }}
          />
        )}

        {cancelFor && (
          <CancelRequestModal
            open={true}
            onClose={() => setCancelFor(null)}
            reason={cancelFor.cancel?.reason}
            busy={busy}
            onReject={async () => {
              try {
                setBusy(true);
                await rejectCancel(cancelFor.id);
                setCancelFor(null);
                await refresh();
              } finally {
                setBusy(false);
              }
            }}
            onApprove={async () => {
              try {
                setBusy(true);
                await approveCancel(cancelFor.id);
                setCancelFor(null);
                await refresh();
              } finally {
                setBusy(false);
              }
            }}
          />
        )}
      </div>
    </AdminGate>
  );
}
