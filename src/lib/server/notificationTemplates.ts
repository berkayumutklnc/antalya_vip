/**
 * Notification template registry.
 *
 * All notification types with their email subject/body builders and
 * WhatsApp message builders live here. Routes never hand-roll
 * notification strings.
 *
 * Templates are intentionally simple string builders.
 * No i18n framework — just conditional branches per lang.
 */

// ---------------------------------------------------------------------------
// Notification types
// ---------------------------------------------------------------------------

export const NOTIFICATION_TYPES = [
  "reservation_created_customer",
  "reservation_created_admin",
  "vehicle_assigned_customer",
  "cancel_requested_admin",
  "cancel_approved_customer",
  "cancel_rejected_customer",
  "status_changed_customer",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export function isValidNotificationType(s: unknown): s is NotificationType {
  return typeof s === "string" && (NOTIFICATION_TYPES as readonly string[]).includes(s);
}

// ---------------------------------------------------------------------------
// Common reservation shape for template rendering
// ---------------------------------------------------------------------------

export interface TemplateData {
  code: string;
  fullName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  adults?: number;
  babySeat?: number;
  vehicleType?: string | null;
  serviceVariantKey?: string | null;
  price?: number | null;
  email: string;
  phone: string;
  lang?: string;
  // assignment
  driverName?: string | null;
  driverPhone?: string | null;
  plate?: string | null;
  // cancel
  cancelReason?: string | null;
  // status
  newStatus?: string | null;
}

// ---------------------------------------------------------------------------
// Email templates — subject + templateParams for EmailJS
// ---------------------------------------------------------------------------

export interface EmailTemplate {
  /** Which EmailJS template key to use */
  templateKey: "reservation" | "assign" | "cancel";
  /** Params to pass to EmailJS template */
  params: Record<string, unknown>;
}

export function getEmailTemplate(
  type: NotificationType,
  data: TemplateData,
): EmailTemplate | null {
  switch (type) {
    case "reservation_created_customer":
      return {
        templateKey: "reservation",
        params: {
          id: data.code,
          fullName: data.fullName,
          from: data.from,
          to: data.to,
          date: data.date,
          time: data.time,
          passengers: data.adults ?? 1,
          babySeat: data.babySeat ?? 0,
          vehicleType: data.vehicleType ?? "-",
          price: data.price ?? "-",
          email: data.email,
          phone: data.phone,
          lang: data.lang ?? "tr",
        },
      };

    case "reservation_created_admin":
      return {
        templateKey: "reservation",
        params: {
          id: data.code,
          fullName: data.fullName,
          from: data.from,
          to: data.to,
          date: data.date,
          time: data.time,
          passengers: data.adults ?? 1,
          babySeat: data.babySeat ?? 0,
          vehicleType: data.vehicleType ?? "-",
          price: data.price ?? "-",
          email: "admin",
          phone: data.phone,
          lang: "tr",
        },
      };

    case "vehicle_assigned_customer":
      return {
        templateKey: "assign",
        params: {
          code: data.code,
          email: data.email,
          fullName: data.fullName ?? "-",
          from: data.from,
          to: data.to,
          date: data.date,
          time: data.time,
          driverName: data.driverName ?? "-",
          driverPhone: data.driverPhone ?? "-",
          vehiclePlate: data.plate ?? "-",
        },
      };

    case "cancel_requested_admin":
      return {
        templateKey: "cancel",
        params: {
          code: data.code,
          email: data.email,
          fullName: data.fullName ?? "-",
          from: data.from,
          to: data.to,
          date: data.date,
          time: data.time,
          reason: data.cancelReason ?? "-",
        },
      };

    case "cancel_approved_customer":
      return {
        templateKey: "cancel",
        params: {
          code: data.code,
          email: data.email,
          fullName: data.fullName ?? "-",
          from: data.from,
          to: data.to,
          date: data.date,
          time: data.time,
          reason: "İptal talebiniz onaylandı / Your cancellation has been approved.",
        },
      };

    case "cancel_rejected_customer":
      return {
        templateKey: "cancel",
        params: {
          code: data.code,
          email: data.email,
          fullName: data.fullName ?? "-",
          from: data.from,
          to: data.to,
          date: data.date,
          time: data.time,
          reason: "İptal talebiniz reddedildi / Your cancellation request has been declined.",
        },
      };

    case "status_changed_customer":
      return {
        templateKey: "reservation",
        params: {
          id: data.code,
          fullName: data.fullName ?? "-",
          from: data.from,
          to: data.to,
          date: data.date,
          time: data.time,
          passengers: data.adults ?? 1,
          babySeat: data.babySeat ?? 0,
          vehicleType: data.vehicleType ?? "-",
          price: data.price ?? "-",
          email: data.email,
          phone: data.phone,
          lang: data.lang ?? "tr",
          status: data.newStatus ?? "-",
        },
      };

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// WhatsApp message templates
// ---------------------------------------------------------------------------

export type WhatsAppIntent =
  | "contact_customer_about_reservation"
  | "send_pickup_reminder"
  | "contact_driver_about_assignment";

export function getWhatsAppMessage(
  intent: WhatsAppIntent,
  data: TemplateData,
): string {
  switch (intent) {
    case "contact_customer_about_reservation":
      return `Sayın ${data.fullName}, ${data.date} ${data.time} ${data.from} → ${data.to} transferiniz hakkında bilgi için yazıyoruz. Kod: ${data.code}`;

    case "send_pickup_reminder":
      return `Sayın ${data.fullName}, ${data.date} ${data.time} ${data.from} → ${data.to} transferiniz ONAYLANDI. Şoför: ${data.driverName || "-"} ${data.driverPhone || ""}. Kod: ${data.code}.`;

    case "contact_driver_about_assignment":
      return `Merhaba ${data.driverName || ""}, ${data.date} ${data.time} ${data.from} → ${data.to} transfer atandı. Misafir: ${data.fullName} (${data.phone}). Kod: ${data.code}.`;

    default:
      return `Rezervasyon: ${data.code} — ${data.from} → ${data.to} ${data.date} ${data.time}`;
  }
}

// ---------------------------------------------------------------------------
// Human-readable labels for notification types
// ---------------------------------------------------------------------------

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  reservation_created_customer: "Müşteri Onay E-postası",
  reservation_created_admin: "Admin Yeni Rez. Bildirimi",
  vehicle_assigned_customer: "Müşteri Araç Atama Bildirimi",
  cancel_requested_admin: "Admin İptal Talebi Bildirimi",
  cancel_approved_customer: "Müşteri İptal Onay Bildirimi",
  cancel_rejected_customer: "Müşteri İptal Ret Bildirimi",
  status_changed_customer: "Müşteri Durum Değişikliği",
};

// ---------------------------------------------------------------------------
// Telegram message templates (HTML parse mode)
// ---------------------------------------------------------------------------

export function getTelegramMessage(
  type: NotificationType,
  data: TemplateData,
): string | null {
  switch (type) {
    case "reservation_created_admin":
      return [
        `🆕 <b>Yeni Rezervasyon</b>`,
        ``,
        `<b>Kod:</b> ${esc(data.code)}`,
        `<b>Misafir:</b> ${esc(data.fullName)}`,
        `<b>Telefon:</b> ${esc(data.phone)}`,
        `<b>E-posta:</b> ${esc(data.email)}`,
        `<b>Güzergah:</b> ${esc(data.from)} → ${esc(data.to)}`,
        `<b>Tarih:</b> ${esc(data.date)} ${esc(data.time)}`,
        `<b>Kişi:</b> ${data.adults ?? 1} yetişkin${data.babySeat ? ` + ${data.babySeat} bebek koltuğu` : ""}`,
        `<b>Araç:</b> ${esc(data.vehicleType ?? "-")}`,
        data.serviceVariantKey
          ? `<b>Paket:</b> ${data.serviceVariantKey === "maybach" ? "🏅 Maybach" : "✅ Standart"}`
          : "",
        data.price ? `<b>Fiyat:</b> €${data.price}` : "",
      ].filter(Boolean).join("\n");

    case "cancel_requested_admin":
      return [
        `❌ <b>İptal Talebi</b>`,
        ``,
        `<b>Kod:</b> ${esc(data.code)}`,
        `<b>Misafir:</b> ${esc(data.fullName)}`,
        `<b>Güzergah:</b> ${esc(data.from)} → ${esc(data.to)}`,
        `<b>Tarih:</b> ${esc(data.date)} ${esc(data.time)}`,
        data.cancelReason ? `<b>Sebep:</b> ${esc(data.cancelReason)}` : "",
      ].filter(Boolean).join("\n");

    default:
      return null;
  }
}

/** Escape HTML special chars for Telegram HTML parse mode */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
