/**
 * Notification log persistence.
 *
 * Writes structured delivery attempt records to the `notification_logs` table.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationChannel = "email" | "telegram" | "whatsapp_link" | "system";
export type NotificationLogStatus = "sent" | "failed" | "skipped" | "generated";
export type TriggeredBy = "public" | "admin" | "system";

export interface NotificationLogEntry {
  reservationId: string;
  reservationCode: string;
  channel: NotificationChannel;
  notificationType: string;
  recipient: string;
  status: NotificationLogStatus;
  errorMessage: string | null;
  providerMeta: Record<string, unknown> | null;
  triggeredBy: TriggeredBy;
  triggeredById: string | null;
  dedupeKey: string | null;
  timestamp: number;
}

/**
 * Write a notification log entry. Fire-and-forget safe.
 */
export async function writeNotificationLog(
  db: SupabaseClient,
  entry: NotificationLogEntry,
): Promise<string> {
  const { data } = await db.from("notification_logs").insert({
    reservation_id: entry.reservationId,
    reservation_code: entry.reservationCode,
    channel: entry.channel,
    notification_type: entry.notificationType,
    recipient: entry.recipient,
    status: entry.status,
    error_message: entry.errorMessage,
    provider_meta: entry.providerMeta,
    triggered_by: entry.triggeredBy,
    triggered_by_id: entry.triggeredById,
    dedupe_key: entry.dedupeKey,
  }).select("id").single();
  return data?.id ?? "";
}

/**
 * Check if a notification with the given dedupeKey was sent
 * within the past `windowMs` milliseconds. Returns true if duplicate found.
 */
export async function isDuplicateNotification(
  db: SupabaseClient,
  dedupeKey: string,
  windowMs: number = 60_000,
): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  const { data } = await db
    .from("notification_logs")
    .select("id")
    .eq("dedupe_key", dedupeKey)
    .eq("status", "sent")
    .gte("created_at", cutoff)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

/**
 * Fetch notification logs for a reservation, newest first.
 */
export async function getNotificationLogs(
  db: SupabaseClient,
  reservationId: string,
  limit: number = 50,
): Promise<(NotificationLogEntry & { id: string })[]> {
  const { data } = await db
    .from("notification_logs")
    .select("*")
    .eq("reservation_id", reservationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((d: any) => ({
    id: d.id,
    reservationId: d.reservation_id,
    reservationCode: d.reservation_code,
    channel: d.channel,
    notificationType: d.notification_type,
    recipient: d.recipient,
    status: d.status,
    errorMessage: d.error_message,
    providerMeta: d.provider_meta,
    triggeredBy: d.triggered_by,
    triggeredById: d.triggered_by_id,
    dedupeKey: d.dedupe_key,
    timestamp: new Date(d.created_at).getTime(),
  }));
}
