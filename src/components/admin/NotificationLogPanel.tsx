"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";

interface NLog {
  id: string;
  channel: string;
  notificationType: string;
  recipient: string;
  status: string;
  errorMessage: string | null;
  timestamp: number;
  triggeredBy: string;
}

const CHANNEL_LABELS: Record<string, string> = {
  email: "E-posta",
  telegram: "Telegram",
  whatsapp_link: "WhatsApp",
  system: "Sistem",
};

const CHANNEL_COLORS: Record<string, string> = {
  email: "bg-blue-900/30 text-blue-300",
  telegram: "bg-cyan-900/30 text-cyan-300",
  whatsapp_link: "bg-green-900/30 text-green-300",
  system: "bg-white/5 text-white/60",
};

const STATUS_COLORS: Record<string, string> = {
  sent: "text-green-400",
  failed: "text-red-400",
  skipped: "text-yellow-400",
  generated: "text-blue-400",
};

const TYPE_LABELS: Record<string, string> = {
  reservation_created_customer: "Müşteri Onay",
  reservation_created_admin: "Admin Bildirim",
  vehicle_assigned_customer: "Araç Atama",
  cancel_requested_admin: "İptal Talebi (Admin)",
  cancel_approved_customer: "İptal Onay",
  cancel_rejected_customer: "İptal Ret",
  status_changed_customer: "Durum Değişikliği",
  contact_customer_about_reservation: "WhatsApp Müşteri",
  send_pickup_reminder: "WhatsApp Hatırlatma",
  contact_driver_about_assignment: "WhatsApp Şoför",
};

const RESEND_TYPES = [
  { value: "reservation_created_customer", label: "Müşteri Onay E-postası" },
  { value: "vehicle_assigned_customer", label: "Araç Atama Bildirimi" },
  { value: "cancel_approved_customer", label: "İptal Onay Bildirimi" },
  { value: "cancel_rejected_customer", label: "İptal Ret Bildirimi" },
];

export default function NotificationLogPanel({ rid }: { rid: string }) {
  const [logs, setLogs] = useState<NLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [selectedType, setSelectedType] = useState(RESEND_TYPES[0].value);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  async function getAuthHeaders(): Promise<HeadersInit> {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not authenticated");
    return { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
  }

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/reservations/${rid}/notifications`, { headers });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [rid]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleResend = async () => {
    try {
      setResending(true);
      setFeedback(null);
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/reservations/${rid}/notifications/resend`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type: selectedType }),
      });
      const data = await res.json();
      if (data.ok) {
        setFeedback({ ok: true, msg: "Bildirim gönderildi." });
      } else {
        setFeedback({ ok: false, msg: data.result?.error || data.error || "Gönderilemedi." });
      }
      fetchLogs(); // refresh
    } catch (e: unknown) {
      setFeedback({ ok: false, msg: e instanceof Error ? e.message : "Hata oluştu" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900 p-4">
      <h2 className="text-lg font-semibold mb-4">Bildirim Geçmişi</h2>

      {/* Resend controls */}
      <div className="flex flex-wrap items-end gap-2 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-white/50 mb-1">Tekrar Gönder</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-neutral-800 border border-white/10 rounded px-3 py-1.5 text-sm"
          >
            {RESEND_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleResend}
          disabled={resending}
          className="px-4 py-1.5 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {resending ? "Gönderiliyor..." : "Gönder"}
        </button>
      </div>

      {feedback && (
        <div className={`text-sm mb-3 ${feedback.ok ? "text-green-400" : "text-red-400"}`}>
          {feedback.msg}
        </div>
      )}

      {/* Log list */}
      {loading ? (
        <div className="text-sm text-white/50">Yükleniyor...</div>
      ) : logs.length === 0 ? (
        <div className="text-sm text-white/50">Henüz bildirim kaydı yok.</div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="rounded border border-white/5 bg-neutral-800/50 p-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${CHANNEL_COLORS[log.channel] || "bg-white/5 text-white/60"}`}>
                    {CHANNEL_LABELS[log.channel] || log.channel}
                  </span>
                  <span className="font-medium">
                    {TYPE_LABELS[log.notificationType] || log.notificationType}
                  </span>
                </div>
                <span className={`text-xs font-medium ${STATUS_COLORS[log.status] || "text-white/50"}`}>
                  {log.status === "sent" ? "✓ Gönderildi" : log.status === "failed" ? "✗ Başarısız" : log.status === "generated" ? "↗ Link Oluşturuldu" : "⊘ Atlandı"}
                </span>
              </div>
              <div className="text-xs text-white/40 mt-1">
                {new Date(log.timestamp).toLocaleString()} • {log.recipient} • {log.triggeredBy}
              </div>
              {log.errorMessage && (
                <div className="text-xs text-red-400/70 mt-1">{log.errorMessage}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
