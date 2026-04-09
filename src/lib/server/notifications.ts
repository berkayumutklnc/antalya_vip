/**
 * Central notification service.
 *
 * Routes call `notify()` instead of provider-specific code directly.
 * The service handles:
 *  1. Template lookup
 *  2. Deduplication check
 *  3. Email dispatch via EmailJS
 *  4. Logging the attempt to notification_logs
 *
 * Design:
 * - All notifications are non-blocking fire-and-forget by default
 * - Business mutations must NOT depend on notification success
 * - Failures are logged, never thrown back to the caller
 */

import type { Firestore } from "firebase-admin/firestore";
import {
  type NotificationType,
  type TemplateData,
  getEmailTemplate,
} from "./notificationTemplates";
import {
  writeNotificationLog,
  isDuplicateNotification,
  type TriggeredBy,
} from "./notificationLog";

// ---------------------------------------------------------------------------
// Email provider (EmailJS REST)
// ---------------------------------------------------------------------------

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

const TEMPLATE_IDS: Record<string, string | undefined> = {
  reservation: process.env.EMAILJS_TEMPLATE_ID,
  assign: process.env.EMAILJS_ASSIGN_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID,
  cancel: process.env.EMAILJS_CANCEL_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID,
};

function emailConfigured(): boolean {
  return Boolean(SERVICE_ID && PUBLIC_KEY && TEMPLATE_IDS.reservation);
}

interface EmailSendResult {
  ok: boolean;
  statusCode?: number;
  error?: string;
}

async function sendViaEmailJs(
  templateKey: string,
  params: Record<string, unknown>,
): Promise<EmailSendResult> {
  if (!emailConfigured()) {
    return { ok: false, error: "EmailJS not configured" };
  }

  const templateId = TEMPLATE_IDS[templateKey];
  if (!templateId) {
    return { ok: false, error: `No template ID for key: ${templateKey}` };
  }

  const body: Record<string, unknown> = {
    service_id: SERVICE_ID,
    template_id: templateId,
    user_id: PUBLIC_KEY,
    template_params: params,
  };
  if (PRIVATE_KEY) body.accessToken = PRIVATE_KEY;

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      return { ok: true, statusCode: res.status };
    }
    const text = await res.text().catch(() => "");
    return { ok: false, statusCode: res.status, error: text.slice(0, 500) };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg.slice(0, 500) };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface NotifyOptions {
  db: Firestore;
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
 * Central notification dispatch.
 *
 * 1. Looks up email template for the notification type
 * 2. Checks deduplication window (60s default)
 * 3. Sends email via provider
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

    // Send
    const result = await sendViaEmailJs(template.templateKey, template.params);

    const logId = await writeNotificationLog(db, {
      reservationId: data.code,
      reservationCode: data.code,
      channel: "email",
      notificationType: type,
      recipient,
      status: result.ok ? "sent" : "failed",
      errorMessage: result.error ?? null,
      providerMeta: result.statusCode ? { statusCode: result.statusCode } : null,
      triggeredBy,
      triggeredById,
      dedupeKey,
      timestamp: Date.now(),
    });

    if (!result.ok) {
      console.error(`[notify] ${type} failed for ${data.code}:`, result.error);
    }

    return { sent: result.ok, skipped: false, error: result.error ?? null, logId };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[notify] unexpected error for ${type}/${data.code}:`, msg);

    // Best-effort log even on unexpected errors
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
// WhatsApp link logging (not delivery — deep link generation)
// ---------------------------------------------------------------------------

export async function logWhatsAppAction(
  db: Firestore,
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
    status: "sent", // deep link generated, not guaranteed delivery
    errorMessage: null,
    providerMeta: { note: "wa.me deep link generated, delivery not guaranteed" },
    triggeredBy: opts.triggeredBy,
    triggeredById: opts.triggeredById ?? null,
    dedupeKey: null,
    timestamp: Date.now(),
  });
}
