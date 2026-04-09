/**
 * Notification log persistence.
 *
 * Writes structured delivery attempt records to a top-level
 * `notification_logs` Firestore collection via firebase-admin.
 *
 * Schema:
 * - reservationId        — doc ID of the reservation
 * - reservationCode      — human-visible PNR code
 * - channel              — "email" | "whatsapp_link" | "system"
 * - notificationType     — e.g. "reservation_created_customer"
 * - recipient            — email address or phone number (masked for WA)
 * - status               — "sent" | "failed" | "skipped"
 * - errorMessage         — failure reason (null on success)
 * - providerMeta         — minimal provider-specific info (status code etc.)
 * - triggeredBy          — "public" | "admin" | "system"
 * - triggeredById        — admin UID or null
 * - dedupeKey            — optional key for idempotency checks
 * - timestamp            — epoch ms
 */

import type { Firestore } from "firebase-admin/firestore";

export type NotificationChannel = "email" | "whatsapp_link" | "system";
export type NotificationLogStatus = "sent" | "failed" | "skipped";
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
  db: Firestore,
  entry: NotificationLogEntry,
): Promise<string> {
  const ref = await db.collection("notification_logs").add({
    ...entry,
    timestamp: entry.timestamp || Date.now(),
  });
  return ref.id;
}

/**
 * Check if a notification with the given dedupeKey was sent
 * within the past `windowMs` milliseconds. Returns true if duplicate found.
 */
export async function isDuplicateNotification(
  db: Firestore,
  dedupeKey: string,
  windowMs: number = 60_000,
): Promise<boolean> {
  const cutoff = Date.now() - windowMs;
  const snap = await db
    .collection("notification_logs")
    .where("dedupeKey", "==", dedupeKey)
    .where("status", "==", "sent")
    .where("timestamp", ">", cutoff)
    .limit(1)
    .get();
  return !snap.empty;
}

/**
 * Fetch notification logs for a reservation, newest first.
 */
export async function getNotificationLogs(
  db: Firestore,
  reservationId: string,
  limit: number = 50,
): Promise<(NotificationLogEntry & { id: string })[]> {
  const snap = await db
    .collection("notification_logs")
    .where("reservationId", "==", reservationId)
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as NotificationLogEntry) }));
}
