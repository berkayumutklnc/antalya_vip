/**
 * Server-side email abstraction.
 * Uses EmailJS REST API (server-to-server) with private env vars.
 * Falls back to no-op logging if keys are not configured.
 */

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

const TEMPLATE_RESERVATION = process.env.EMAILJS_TEMPLATE_ID;
const TEMPLATE_ASSIGN = process.env.EMAILJS_ASSIGN_TEMPLATE_ID || TEMPLATE_RESERVATION;
const TEMPLATE_CANCEL = process.env.EMAILJS_CANCEL_TEMPLATE_ID || TEMPLATE_RESERVATION;

function isConfigured(): boolean {
  return Boolean(SERVICE_ID && PUBLIC_KEY && TEMPLATE_RESERVATION);
}

async function sendEmailJs(templateId: string, params: Record<string, unknown>) {
  if (!isConfigured()) {
    console.log("[email] EmailJS not configured, skipping:", JSON.stringify(params));
    return;
  }

  const body: Record<string, unknown> = {
    service_id: SERVICE_ID,
    template_id: templateId,
    user_id: PUBLIC_KEY,
    template_params: params,
  };

  if (PRIVATE_KEY) {
    body.accessToken = PRIVATE_KEY;
  }

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[email] EmailJS error ${res.status}:`, text);
  }
}

export interface ReservationEmailPayload {
  id: string;
  fullName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  adults: number;
  babySeat: number;
  vehicleType?: string | null;
  price?: number | null;
  email: string;
  phone: string;
  lang?: string;
}

export async function sendReservationEmail(p: ReservationEmailPayload) {
  await sendEmailJs(TEMPLATE_RESERVATION!, {
    id: p.id,
    fullName: p.fullName,
    from: p.from,
    to: p.to,
    date: p.date,
    time: p.time,
    passengers: p.adults,
    babySeat: p.babySeat,
    vehicleType: p.vehicleType ?? "-",
    price: p.price ?? "-",
    email: p.email,
    phone: p.phone,
    lang: p.lang ?? "tr",
  });
}

export interface AssignEmailPayload {
  code: string;
  email: string;
  fullName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
}

export async function sendAssignEmail(p: AssignEmailPayload) {
  await sendEmailJs(TEMPLATE_ASSIGN!, {
    code: p.code,
    email: p.email,
    fullName: p.fullName ?? "-",
    from: p.from,
    to: p.to,
    date: p.date,
    time: p.time,
    driverName: p.driverName ?? "-",
    driverPhone: p.driverPhone ?? "-",
    vehiclePlate: p.vehiclePlate ?? "-",
  });
}

export interface CancelRequestEmailPayload {
  code: string;
  email: string;
  fullName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  reason: string;
}

export async function sendCancelRequestEmail(p: CancelRequestEmailPayload) {
  await sendEmailJs(TEMPLATE_CANCEL!, {
    code: p.code,
    email: p.email,
    fullName: p.fullName ?? "-",
    from: p.from,
    to: p.to,
    date: p.date,
    time: p.time,
    reason: p.reason,
  });
}
