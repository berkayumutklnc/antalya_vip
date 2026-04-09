import { describe, it, expect } from "vitest";
import {
  RESERVATION_STATUSES,
  isValidStatus,
  isTerminal,
  canTransition,
  assertTransition,
  TransitionError,
  canRequestCancel,
  canAssignVehicle,
  canApproveCancel,
  canRejectCancel,
  canAdminSetStatus,
} from "@/lib/domain/reservationStatus";

describe("isValidStatus", () => {
  it("accepts all canonical statuses", () => {
    for (const s of RESERVATION_STATUSES) {
      expect(isValidStatus(s)).toBe(true);
    }
  });

  it("rejects invalid strings", () => {
    expect(isValidStatus("active")).toBe(false);
    expect(isValidStatus("")).toBe(false);
    expect(isValidStatus("PENDING")).toBe(false);
  });

  it("rejects non-strings", () => {
    expect(isValidStatus(42)).toBe(false);
    expect(isValidStatus(null)).toBe(false);
    expect(isValidStatus(undefined)).toBe(false);
  });
});

describe("isTerminal", () => {
  it("completed, no_show, canceled are terminal", () => {
    expect(isTerminal("completed")).toBe(true);
    expect(isTerminal("no_show")).toBe(true);
    expect(isTerminal("canceled")).toBe(true);
  });

  it("pending and confirmed are not terminal", () => {
    expect(isTerminal("pending")).toBe(false);
    expect(isTerminal("confirmed")).toBe(false);
  });
});

describe("canTransition", () => {
  it("pending → confirmed is allowed", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
  });

  it("pending → canceled is allowed", () => {
    expect(canTransition("pending", "canceled")).toBe(true);
  });

  it("confirmed → completed is allowed", () => {
    expect(canTransition("confirmed", "completed")).toBe(true);
  });

  it("confirmed → no_show is allowed", () => {
    expect(canTransition("confirmed", "no_show")).toBe(true);
  });

  it("confirmed → canceled is allowed", () => {
    expect(canTransition("confirmed", "canceled")).toBe(true);
  });

  it("pending → completed is NOT allowed", () => {
    expect(canTransition("pending", "completed")).toBe(false);
  });

  it("terminal statuses cannot transition anywhere", () => {
    for (const terminal of ["completed", "no_show", "canceled"] as const) {
      for (const target of RESERVATION_STATUSES) {
        expect(canTransition(terminal, target)).toBe(false);
      }
    }
  });

  it("no self-transitions", () => {
    for (const s of RESERVATION_STATUSES) {
      expect(canTransition(s, s)).toBe(false);
    }
  });
});

describe("assertTransition", () => {
  it("does not throw for valid transition", () => {
    expect(() => assertTransition("pending", "confirmed")).not.toThrow();
  });

  it("throws TransitionError for invalid transition", () => {
    expect(() => assertTransition("completed", "pending")).toThrow(TransitionError);
  });

  it("TransitionError has status 409", () => {
    try {
      assertTransition("canceled", "confirmed");
    } catch (e) {
      expect(e).toBeInstanceOf(TransitionError);
      expect((e as TransitionError).status).toBe(409);
    }
  });
});

describe("canRequestCancel", () => {
  it("allows cancel for pending reservation far in future", () => {
    const r = { status: "pending" as const, startAt: Date.now() + 24 * 60 * 60 * 1000 };
    expect(canRequestCancel(r).ok).toBe(true);
  });

  it("blocks cancel for already canceled", () => {
    expect(canRequestCancel({ status: "canceled" as const }).ok).toBe(false);
  });

  it("blocks cancel when already requested", () => {
    expect(canRequestCancel({ status: "pending" as const, cancel: { requested: true } }).ok).toBe(false);
  });

  it("blocks cancel within 12-hour window", () => {
    const r = { status: "pending" as const, startAt: Date.now() + 6 * 60 * 60 * 1000 };
    const result = canRequestCancel(r);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("too_late");
  });
});

describe("canAssignVehicle", () => {
  it("allows assignment for pending reservation", () => {
    expect(canAssignVehicle({ status: "pending" as const }).ok).toBe(true);
  });

  it("blocks assignment for canceled reservation", () => {
    expect(canAssignVehicle({ status: "canceled" as const }).ok).toBe(false);
  });

  it("blocks assignment when cancel is pending", () => {
    expect(canAssignVehicle({ status: "pending" as const, cancel: { requested: true } }).ok).toBe(false);
  });

  it("blocks assignment for confirmed reservation", () => {
    expect(canAssignVehicle({ status: "confirmed" as const }).ok).toBe(false);
  });
});

describe("canApproveCancel", () => {
  it("allows when cancel is requested", () => {
    expect(canApproveCancel({ status: "confirmed" as const, cancel: { requested: true } }).ok).toBe(true);
  });

  it("blocks when no cancel requested", () => {
    expect(canApproveCancel({ status: "confirmed" as const }).ok).toBe(false);
  });

  it("blocks when already canceled", () => {
    expect(canApproveCancel({ status: "canceled" as const, cancel: { requested: true } }).ok).toBe(false);
  });
});

describe("canRejectCancel", () => {
  it("allows when cancel is requested", () => {
    expect(canRejectCancel({ status: "confirmed" as const, cancel: { requested: true } }).ok).toBe(true);
  });

  it("blocks when no cancel requested", () => {
    expect(canRejectCancel({ status: "confirmed" as const }).ok).toBe(false);
  });
});

describe("canAdminSetStatus", () => {
  it("allows pending → confirmed", () => {
    expect(canAdminSetStatus({ status: "pending" as const }, "confirmed").ok).toBe(true);
  });

  it("blocks invalid target status", () => {
    // @ts-expect-error testing invalid input
    expect(canAdminSetStatus({ status: "pending" as const }, "bogus").ok).toBe(false);
  });

  it("blocks invalid transition", () => {
    expect(canAdminSetStatus({ status: "completed" as const }, "pending").ok).toBe(false);
  });
});
