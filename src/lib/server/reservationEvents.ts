/**
 * Reservation event logging.
 *
 * Writes structured audit events to a top-level `reservation_events`
 * collection.  A top-level collection (rather than a subcollection) was
 * chosen because:
 *  - it allows cross-reservation queries (e.g. "all events by admin X")
 *  - Firestore subcollection group queries work but add complexity
 *  - a flat collection is simpler to export, index, and paginate
 *
 * Each event document is auto-ID'd and immutable (append-only log).
 */

import type { Firestore } from "firebase-admin/firestore";

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export const EVENT_TYPES = [
  "reservation_created",
  "status_changed",
  "vehicle_assigned",
  "cancel_requested",
  "cancel_approved",
  "cancel_rejected",
] as const;

export type ReservationEventType = (typeof EVENT_TYPES)[number];

export type ActorType = "public" | "admin" | "system";

export interface ReservationEvent {
  reservationId: string;
  reservationCode: string;
  type: ReservationEventType;
  timestamp: number;
  actorType: ActorType;
  actorId: string | null;
  meta: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Writer
// ---------------------------------------------------------------------------

/**
 * Append a reservation event.  Fire-and-forget safe — callers should
 * `.catch()` to avoid unhandled rejections in non-critical paths.
 */
export async function logReservationEvent(
  db: Firestore,
  event: ReservationEvent,
): Promise<void> {
  await db.collection("reservation_events").add({
    ...event,
    timestamp: event.timestamp || Date.now(),
  });
}

// ---------------------------------------------------------------------------
// Convenience builders
// ---------------------------------------------------------------------------

interface BaseOpts {
  db: Firestore;
  reservationId: string;
  reservationCode: string;
  actorType: ActorType;
  actorId?: string | null;
}

export async function logCreated(
  opts: BaseOpts & { meta?: Record<string, unknown> },
) {
  return logReservationEvent(opts.db, {
    reservationId: opts.reservationId,
    reservationCode: opts.reservationCode,
    type: "reservation_created",
    timestamp: Date.now(),
    actorType: opts.actorType,
    actorId: opts.actorId ?? null,
    meta: opts.meta ?? {},
  });
}

export async function logStatusChanged(
  opts: BaseOpts & { fromStatus: string; toStatus: string; meta?: Record<string, unknown> },
) {
  return logReservationEvent(opts.db, {
    reservationId: opts.reservationId,
    reservationCode: opts.reservationCode,
    type: "status_changed",
    timestamp: Date.now(),
    actorType: opts.actorType,
    actorId: opts.actorId ?? null,
    meta: { fromStatus: opts.fromStatus, toStatus: opts.toStatus, ...opts.meta },
  });
}

export async function logVehicleAssigned(
  opts: BaseOpts & { vehicleId: string; plate?: string | null; meta?: Record<string, unknown> },
) {
  return logReservationEvent(opts.db, {
    reservationId: opts.reservationId,
    reservationCode: opts.reservationCode,
    type: "vehicle_assigned",
    timestamp: Date.now(),
    actorType: opts.actorType,
    actorId: opts.actorId ?? null,
    meta: { vehicleId: opts.vehicleId, plate: opts.plate ?? null, ...opts.meta },
  });
}

export async function logCancelRequested(
  opts: BaseOpts & { reason?: string | null },
) {
  return logReservationEvent(opts.db, {
    reservationId: opts.reservationId,
    reservationCode: opts.reservationCode,
    type: "cancel_requested",
    timestamp: Date.now(),
    actorType: opts.actorType,
    actorId: opts.actorId ?? null,
    meta: { reason: opts.reason ?? null },
  });
}

export async function logCancelApproved(opts: BaseOpts) {
  return logReservationEvent(opts.db, {
    reservationId: opts.reservationId,
    reservationCode: opts.reservationCode,
    type: "cancel_approved",
    timestamp: Date.now(),
    actorType: opts.actorType,
    actorId: opts.actorId ?? null,
    meta: {},
  });
}

export async function logCancelRejected(opts: BaseOpts) {
  return logReservationEvent(opts.db, {
    reservationId: opts.reservationId,
    reservationCode: opts.reservationCode,
    type: "cancel_rejected",
    timestamp: Date.now(),
    actorType: opts.actorType,
    actorId: opts.actorId ?? null,
    meta: {},
  });
}
