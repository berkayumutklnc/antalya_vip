import { describe, it, expect } from "vitest";
import {
  NOTIFICATION_TYPES,
  isValidNotificationType,
  getTelegramMessage,
  getEmailTemplate,
  NOTIFICATION_TYPE_LABELS,
} from "@/lib/server/notificationTemplates";

/**
 * Tests for notification templates:
 *  - Telegram message output for admin alerts
 *  - Email template key generation
 *  - Notification type validation
 */

const SAMPLE_DATA = {
  code: "TRF-ABC1234",
  fullName: "Max Müller",
  phone: "+491234567890",
  email: "max@example.com",
  from: "Antalya Airport (AYT)",
  to: "Belek",
  date: "2026-06-15",
  time: "14:30",
  adults: 2,
  babySeat: 1,
  vehicleType: "vip-10",
  price: 120,
  lang: "de" as const,
};

describe("NOTIFICATION_TYPES", () => {
  it("has exactly 7 notification types", () => {
    expect(NOTIFICATION_TYPES).toHaveLength(7);
  });

  it("includes all expected types", () => {
    expect(NOTIFICATION_TYPES).toContain("reservation_created_customer");
    expect(NOTIFICATION_TYPES).toContain("reservation_created_admin");
    expect(NOTIFICATION_TYPES).toContain("vehicle_assigned_customer");
    expect(NOTIFICATION_TYPES).toContain("cancel_requested_admin");
  });
});

describe("isValidNotificationType", () => {
  it("accepts valid types", () => {
    expect(isValidNotificationType("reservation_created_admin")).toBe(true);
    expect(isValidNotificationType("cancel_requested_admin")).toBe(true);
  });

  it("rejects invalid strings", () => {
    expect(isValidNotificationType("fake_type")).toBe(false);
    expect(isValidNotificationType("")).toBe(false);
  });

  it("rejects non-string values", () => {
    expect(isValidNotificationType(42)).toBe(false);
    expect(isValidNotificationType(null)).toBe(false);
  });
});

describe("getTelegramMessage", () => {
  it("generates admin alert for new reservation", () => {
    const msg = getTelegramMessage("reservation_created_admin", SAMPLE_DATA);
    expect(msg).not.toBeNull();
    expect(msg).toContain("Yeni Rezervasyon");
    expect(msg).toContain("TRF-ABC1234");
    expect(msg).toContain("Max Müller");
    expect(msg).toContain("Belek");
    expect(msg).toContain("€120");
  });

  it("generates cancel request admin alert", () => {
    const cancelData = { ...SAMPLE_DATA, cancelReason: "Flight canceled" };
    const msg = getTelegramMessage("cancel_requested_admin", cancelData);
    expect(msg).not.toBeNull();
    expect(msg).toContain("İptal Talebi");
    expect(msg).toContain("Flight canceled");
  });

  it("returns null for customer-facing types (no Telegram template)", () => {
    expect(getTelegramMessage("reservation_created_customer", SAMPLE_DATA)).toBeNull();
    expect(getTelegramMessage("vehicle_assigned_customer", SAMPLE_DATA)).toBeNull();
    expect(getTelegramMessage("status_changed_customer", SAMPLE_DATA)).toBeNull();
  });

  it("escapes HTML special characters", () => {
    const htmlData = { ...SAMPLE_DATA, fullName: "A<B>C&D" };
    const msg = getTelegramMessage("reservation_created_admin", htmlData);
    expect(msg).toContain("A&lt;B&gt;C&amp;D");
    expect(msg).not.toContain("<B>");
  });

  it("handles missing optional fields", () => {
    const minimal = { ...SAMPLE_DATA, price: undefined, babySeat: 0 };
    const msg = getTelegramMessage("reservation_created_admin", minimal);
    expect(msg).not.toBeNull();
    expect(msg).not.toContain("€");
    expect(msg).not.toContain("bebek");
  });
});

describe("getEmailTemplate", () => {
  it("returns reservation template for customer creation", () => {
    const result = getEmailTemplate("reservation_created_customer", SAMPLE_DATA);
    expect(result).not.toBeNull();
    expect(result!.templateKey).toBe("reservation");
  });

  it("returns reservation template for admin creation", () => {
    const result = getEmailTemplate("reservation_created_admin", SAMPLE_DATA);
    expect(result).not.toBeNull();
    expect(result!.templateKey).toBe("reservation");
  });

  it("returns assign template for vehicle assignment", () => {
    const assignData = { ...SAMPLE_DATA, driverName: "Ahmet", driverPhone: "+90123", vehiclePlate: "07 AX 123" };
    const result = getEmailTemplate("vehicle_assigned_customer", assignData);
    expect(result).not.toBeNull();
    expect(result!.templateKey).toBe("assign");
  });

  it("returns cancel template for cancel request", () => {
    const cancelData = { ...SAMPLE_DATA, cancelReason: "Schedule change" };
    const result = getEmailTemplate("cancel_requested_admin", cancelData);
    expect(result).not.toBeNull();
    expect(result!.templateKey).toBe("cancel");
  });
});

describe("NOTIFICATION_TYPE_LABELS", () => {
  it("has a label for every notification type", () => {
    for (const type of NOTIFICATION_TYPES) {
      expect(NOTIFICATION_TYPE_LABELS[type]).toBeDefined();
      expect(typeof NOTIFICATION_TYPE_LABELS[type]).toBe("string");
    }
  });
});
