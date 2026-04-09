/**
 * Canonical reservation status model and state-transition rules.
 *
 * Every route that reads or mutates reservation status MUST use these
 * helpers instead of ad-hoc string checks.
 */

// ---------------------------------------------------------------------------
// Canonical statuses
// ---------------------------------------------------------------------------

export const RESERVATION_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "no_show",
  "canceled",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export function isValidStatus(s: unknown): s is ReservationStatus {
  return typeof s === "string" && (RESERVATION_STATUSES as readonly string[]).includes(s);
}

/** Terminal statuses — no transitions allowed out of these. */
export const TERMINAL_STATUSES: readonly ReservationStatus[] = ["completed", "no_show", "canceled"];

export function isTerminal(s: ReservationStatus): boolean {
  return TERMINAL_STATUSES.includes(s);
}

// ---------------------------------------------------------------------------
// Transition rules
// ---------------------------------------------------------------------------

/**
 * Allowed transitions keyed by current status.
 * `cancel_requested` is modelled as an orthogonal flag, not a status.
 *
 * State machine:
 *   pending   → confirmed, canceled
 *   confirmed → completed, no_show, canceled
 *   completed → (terminal)
 *   no_show   → (terminal)
 *   canceled  → (terminal)
 */
const TRANSITIONS: Record<ReservationStatus, readonly ReservationStatus[]> = {
  pending: ["confirmed", "canceled"],
  confirmed: ["completed", "no_show", "canceled"],
  completed: [],           // terminal
  no_show: [],             // terminal
  canceled: [],            // terminal
};

export function canTransition(
  from: ReservationStatus,
  to: ReservationStatus,
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export class TransitionError extends Error {
  public readonly status = 409;
  constructor(from: ReservationStatus, to: ReservationStatus) {
    super(`Invalid transition: ${from} → ${to}`);
    this.name = "TransitionError";
  }
}

export function assertTransition(from: ReservationStatus, to: ReservationStatus): void {
  if (!canTransition(from, to)) {
    throw new TransitionError(from, to);
  }
}

// ---------------------------------------------------------------------------
// Guard helpers — used by routes before attempting mutations
// ---------------------------------------------------------------------------

export interface ReservationSnapshot {
  status: ReservationStatus;
  cancel?: { requested: boolean } | null;
  startAt?: number | null;
  vehicleId?: string | null;
}

/** Can a vehicle be assigned to this reservation? */
export function canAssignVehicle(r: ReservationSnapshot): { ok: boolean; reason?: string } {
  if (r.status === "canceled") return { ok: false, reason: "Reservation is canceled" };
  if (r.cancel?.requested) return { ok: false, reason: "Cancel request is pending" };
  if (r.status !== "pending") return { ok: false, reason: "Only pending reservations can be assigned" };
  return { ok: true };
}

/** Can the public customer request a cancellation? */
export function canRequestCancel(r: ReservationSnapshot): { ok: boolean; reason?: string } {
  if (r.status === "canceled") return { ok: false, reason: "already_canceled" };
  if (r.cancel?.requested) return { ok: false, reason: "already_requested" };
  // 12-hour window
  const startAt = Number(r.startAt) || 0;
  if (startAt > 0 && startAt - Date.now() < 12 * 60 * 60 * 1000) {
    return { ok: false, reason: "too_late" };
  }
  return { ok: true };
}

/** Can the admin approve a pending cancel request? */
export function canApproveCancel(r: ReservationSnapshot): { ok: boolean; reason?: string } {
  if (!r.cancel?.requested) return { ok: false, reason: "No cancel request pending" };
  if (r.status === "canceled") return { ok: false, reason: "Already canceled" };
  return { ok: true };
}

/** Can the admin reject a pending cancel request? */
export function canRejectCancel(r: ReservationSnapshot): { ok: boolean; reason?: string } {
  if (!r.cancel?.requested) return { ok: false, reason: "No cancel request pending" };
  return { ok: true };
}

/** Can the admin set a raw status? (used by the status PATCH route) */
export function canAdminSetStatus(
  r: ReservationSnapshot,
  targetStatus: ReservationStatus,
): { ok: boolean; reason?: string } {
  if (!isValidStatus(targetStatus)) return { ok: false, reason: "Invalid status value" };
  if (!canTransition(r.status, targetStatus)) {
    return { ok: false, reason: `Cannot transition from ${r.status} to ${targetStatus}` };
  }
  return { ok: true };
}
