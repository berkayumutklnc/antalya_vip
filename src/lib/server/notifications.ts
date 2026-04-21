/**
 * Central notification service.
 *
 * Routes call `notify()` / `notifyTelegram()` instead of provider-specific
 * code directly. The service handles:
 *  1. Template lookup
 *  2. Deduplication check
 *  3. Email dispatch via Resend
 *  4. Telegram dispatch via Bot API
 *  5. Logging every attempt to notification_logs
 *
 * Design:
 * - All notifications are non-blocking fire-and-forget by default
 * - Business mutations must NOT depend on notification success
 * - Failures are logged, never thrown back to the caller
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  type NotificationType,
  type TemplateData,
  getEmailTemplate,
  getTelegramMessage,
} from "./notificationTemplates";
import {
  writeNotificationLog,
  isDuplicateNotification,
  type TriggeredBy,
} from "./notificationLog";
import { sendToAdmins, isTelegramConfigured } from "./telegram";

// ---------------------------------------------------------------------------
// Email provider (Resend)
// ---------------------------------------------------------------------------

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const EMAIL_FROM = process.env.RESEND_FROM_EMAIL ?? "Zenturo Travel <noreply@zenturotravel.com>";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(RESEND_API_KEY);
  return _resend;
}

function emailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

interface EmailSendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/**
 * Build a plain-text email body from template params.
 * Resend sends actual emails (subject + body) rather than
 * filling a third-party template, so we construct the content here.
 */
function buildEmailBody(
  templateKey: string,
  params: Record<string, unknown>,
): { subject: string; html: string } {
  const code = String(params.id ?? params.code ?? "");
  const name = String(params.fullName ?? "");
  const from = String(params.from ?? "");
  const to = String(params.to ?? "");
  const date = String(params.date ?? "");
  const time = String(params.time ?? "");

  switch (templateKey) {
    case "reservation":
      return {
        subject: `Rezervasyon ${code} — ${from} → ${to}`,
        html: [
          `<h2>Rezervasyon Bilgileri</h2>`,
          `<p><strong>Kod:</strong> ${code}</p>`,
          `<p><strong>Ad:</strong> ${name}</p>`,
          `<p><strong>Güzergah:</strong> ${from} → ${to}</p>`,
          `<p><strong>Tarih:</strong> ${date} ${time}</p>`,
          `<p><strong>Kişi:</strong> ${params.passengers ?? 1} yetişkin, ${params.babySeat ?? 0} bebek koltuğu</p>`,
          `<p><strong>Araç:</strong> ${params.vehicleType ?? "-"}</p>`,
          params.price && params.price !== "-" ? `<p><strong>Fiyat:</strong> €${params.price}</p>` : "",
          `<p><strong>Telefon:</strong> ${params.phone ?? "-"}</p>`,
          `<p><strong>E-posta:</strong> ${params.email ?? "-"}</p>`,
          params.status ? `<p><strong>Durum:</strong> ${params.status}</p>` : "",
          `<br/><p>Zenturo Travel</p>`,
        ].filter(Boolean).join("\n"),
      };

    case "assign":
      return {
        subject: `Araç Atandı — Kod ${code}`,
        html: [
          `<h2>Araç Atama Bildirimi</h2>`,
          `<p><strong>Kod:</strong> ${code}</p>`,
          `<p><strong>Güzergah:</strong> ${from} → ${to}</p>`,
          `<p><strong>Tarih:</strong> ${date} ${time}</p>`,
          `<p><strong>Şoför:</strong> ${params.driverName ?? "-"} (${params.driverPhone ?? "-"})</p>`,
          `<p><strong>Plaka:</strong> ${params.vehiclePlate ?? "-"}</p>`,
          `<br/><p>Zenturo Travel</p>`,
        ].join("\n"),
      };

    case "cancel":
      return {
        subject: `İptal Bildirimi — Kod ${code}`,
        html: [
          `<h2>İptal Bildirimi</h2>`,
          `<p><strong>Kod:</strong> ${code}</p>`,
          `<p><strong>Ad:</strong> ${name}</p>`,
          `<p><strong>Güzergah:</strong> ${from} → ${to}</p>`,
          `<p><strong>Tarih:</strong> ${date} ${time}</p>`,
          `<p><strong>Sebep:</strong> ${params.reason ?? "-"}</p>`,
          `<br/><p>Zenturo Travel</p>`,
        ].join("\n"),
      };

    default:
      return {
        subject: `Zenturo Travel Bildirim — ${code}`,
        html: `<p>Rezervasyon kodu: ${code}</p>`,
      };
  }
}

async function sendViaResend(
  templateKey: string,
  params: Record<string, unknown>,
  recipientEmail: string,
): Promise<EmailSendResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "Resend not configured (missing RESEND_API_KEY)" };
  }

  const { subject, html } = buildEmailBody(templateKey, params);

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [recipientEmail],
      subject,
      html,
    });

    if (error) {
      return { ok: false, error: error.message?.slice(0, 500) ?? "Resend error" };
    }

    return { ok: true, id: data?.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg.slice(0, 500) };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface NotifyOptions {
  db: SupabaseClient;
  type: NotificationType;
  data: TemplateData;
  triggeredBy: TriggeredBy;
  triggeredById?: string | null;
  /** Override recipient email (defaults to data.email) */
  recipientOverride?: string;
  /** Skip dedup check */
  skipDedupe?: boolean;
}

export interface NotifyResult {
  sent: boolean;
  skipped: boolean;
  error: string | null;
  logId: string | null;
}

/**
 * Central email notification dispatch.
 *
 * 1. Looks up email template for the notification type
 * 2. Checks deduplication window (60s default)
 * 3. Sends email via Resend
 * 4. Writes notification_logs entry
 *
 * Returns a result object — never throws.
 */
export async function notify(opts: NotifyOptions): Promise<NotifyResult> {
  const {
    db,
    type,
    data,
    triggeredBy,
    triggeredById = null,
    recipientOverride,
    skipDedupe = false,
  } = opts;

  const recipient = recipientOverride || data.email;
  const dedupeKey = `${type}:${data.code}:${recipient}`;

  try {
    // Dedupe check
    if (!skipDedupe) {
      const dup = await isDuplicateNotification(db, dedupeKey, 60_000);
      if (dup) {
        const logId = await writeNotificationLog(db, {
          reservationId: data.code,
          reservationCode: data.code,
          channel: "email",
          notificationType: type,
          recipient,
          status: "skipped",
          errorMessage: "Duplicate within 60s window",
          providerMeta: null,
          triggeredBy,
          triggeredById,
          dedupeKey,
          timestamp: Date.now(),
        });
        return { sent: false, skipped: true, error: null, logId };
      }
    }

    // Template lookup
    const template = getEmailTemplate(type, data);
    if (!template) {
      const logId = await writeNotificationLog(db, {
        reservationId: data.code,
        reservationCode: data.code,
        channel: "email",
        notificationType: type,
        recipient,
        status: "skipped",
        errorMessage: `No template for type: ${type}`,
        providerMeta: null,
        triggeredBy,
        triggeredById,
        dedupeKey,
        timestamp: Date.now(),
      });
      return { sent: false, skipped: true, error: `No template for ${type}`, logId };
    }

    // Send via Resend
    const result = await sendViaResend(template.templateKey, template.params, recipient);

    const logId = await writeNotificationLog(db, {
      reservationId: data.code,
      reservationCode: data.code,
      channel: "email",
      notificationType: type,
      recipient,
      status: result.ok ? "sent" : "failed",
      errorMessage: result.error ?? null,
      providerMeta: result.id ? { resendId: result.id } : null,
      triggeredBy,
      triggeredById,
      dedupeKey,
      timestamp: Date.now(),
    });

    if (!result.ok) {
      console.error(`[notify] ${type} email failed for ${data.code}:`, result.error);
    }

    return { sent: result.ok, skipped: false, error: result.error ?? null, logId };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[notify] unexpected error for ${type}/${data.code}:`, msg);

    let logId: string | null = null;
    try {
      logId = await writeNotificationLog(db, {
        reservationId: data.code,
        reservationCode: data.code,
        channel: "email",
        notificationType: type,
        recipient,
        status: "failed",
        errorMessage: msg.slice(0, 500),
        providerMeta: null,
        triggeredBy,
        triggeredById,
        dedupeKey,
        timestamp: Date.now(),
      });
    } catch {
      // If even logging fails, give up silently
    }

    return { sent: false, skipped: false, error: msg, logId };
  }
}

// ---------------------------------------------------------------------------
// Telegram notification dispatch
// ---------------------------------------------------------------------------

export interface TelegramNotifyResult {
  sent: boolean;
  recipientCount: number;
  errors: string[];
  logIds: string[];
}

/**
 * Send a Telegram notification to all configured admin chat IDs.
 *
 * Builds a Telegram-specific message from the template registry,
 * sends to each admin, and logs each attempt individually.
 *
 * Returns a result object — never throws.
 * DB logging failures never block the actual Telegram send.
 */
export async function notifyTelegram(opts: {
  db: SupabaseClient;
  type: NotificationType;
  data: TemplateData;
  triggeredBy: TriggeredBy;
  triggeredById?: string | null;
}): Promise<TelegramNotifyResult> {
  const { db, type, data, triggeredBy, triggeredById = null } = opts;
  const result: TelegramNotifyResult = { sent: false, recipientCount: 0, errors: [], logIds: [] };

  // Safe log helper — DB errors never throw to the caller
  const safeLog = async (
    status: "sent" | "failed" | "skipped",
    recipient = "admin",
    errorMessage: string | null = null,
    providerMeta: Record<string, unknown> | null = null,
  ) => {
    try {
      const logId = await writeNotificationLog(db, {
        reservationId: data.code,
        reservationCode: data.code,
        channel: "telegram",
        notificationType: type,
        recipient,
        status,
        errorMessage,
        providerMeta,
        triggeredBy,
        triggeredById,
        dedupeKey: null,
        timestamp: Date.now(),
      });
      result.logIds.push(logId);
    } catch {
      // notification_logs table may not exist yet — silently ignore
    }
  };

  if (!isTelegramConfigured()) {
    console.warn(`[notifyTelegram] Telegram not configured (missing env vars) — skipping for ${type}/${data.code}`);
    await safeLog("skipped", "admin", "Telegram not configured");
    return result;
  }

  const message = getTelegramMessage(type, data);
  if (!message) {
    await safeLog("skipped", "admin", `No Telegram template for type: ${type}`);
    return result;
  }

  let sendResults: Awaited<ReturnType<typeof sendToAdmins>>;
  try {
    sendResults = await sendToAdmins(message);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[notifyTelegram] sendToAdmins threw for ${type}/${data.code}:`, msg);
    await safeLog("failed", "admin", msg.slice(0, 500));
    result.errors.push(msg);
    return result;
  }

  result.recipientCount = sendResults.length;
  for (const sr of sendResults) {
    if (sr.ok) result.sent = true;
    if (sr.error) result.errors.push(sr.error);
    await safeLog(
      sr.ok ? "sent" : "failed",
      sr.chatId || "admin",
      sr.error ?? null,
      sr.statusCode ? { statusCode: sr.statusCode, chatId: sr.chatId } : null,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// WhatsApp link logging (not delivery — deep link generation)
// ---------------------------------------------------------------------------

export async function logWhatsAppAction(
  db: SupabaseClient,
  opts: {
    reservationId: string;
    reservationCode: string;
    intent: string;
    recipientPhone: string;
    triggeredBy: TriggeredBy;
    triggeredById?: string | null;
  },
): Promise<string> {
  return writeNotificationLog(db, {
    reservationId: opts.reservationId,
    reservationCode: opts.reservationCode,
    channel: "whatsapp_link",
    notificationType: opts.intent,
    recipient: opts.recipientPhone,
    status: "generated", // deep link generated, not guaranteed delivery
    errorMessage: null,
    providerMeta: { note: "wa.me deep link generated, delivery not guaranteed" },
    triggeredBy: opts.triggeredBy,
    triggeredById: opts.triggeredById ?? null,
    dedupeKey: null,
    timestamp: Date.now(),
  });
}
