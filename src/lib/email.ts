// src/lib/email.ts
import emailjs from "@emailjs/browser";
import type { ReservationRecord } from "@/types/reservation";

type AssignPayload = {
  code: string;
  email: string;
  fullName?: string;
  from: string;
  to: string;
  date: string;
  time: string;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
};

export async function sendAssignMail(payload: AssignPayload) {
  if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID) return;

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  const templateId =
    process.env.NEXT_PUBLIC_EMAILJS_ASSIGN_TEMPLATE_ID ||
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;

  const params = {
    code: payload.code,
    email: payload.email,
    fullName: payload.fullName ?? "-",
    from: payload.from,
    to: payload.to,
    date: payload.date,
    time: payload.time,
    driverName: payload.driverName ?? "-",
    driverPhone: payload.driverPhone ?? "-",
    vehiclePlate: payload.vehiclePlate ?? "-",
  };

  await emailjs.send(serviceId, templateId, params, {
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  });
}

export async function sendReservationMail(record: ReservationRecord) {
  if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID) return;

  await emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
    {
      id: record.id,
      fullName: record.fullName,
      from: record.from,
      to: record.to,
      date: record.date,
      time: record.time,
      passengers: record.adults,
      babySeat: record.babySeat,
      vehicleType: record.vehicleType,
      price: record.price,
      email: record.email,
      phone: record.phone,
      lang: record.lang,
    },
    { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY }
  );
}

type CancelPayload = {
  code: string;
  email: string;
  fullName?: string;
  from: string;
  to: string;
  date: string;
  time: string;
  reason: string;
};

export async function sendCancelRequestMail(payload: CancelPayload) {
  if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID) return;

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  const templateId =
    process.env.NEXT_PUBLIC_EMAILJS_CANCEL_TEMPLATE_ID ||
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;

  const params = {
    code: payload.code,
    email: payload.email,
    fullName: payload.fullName ?? "-",
    from: payload.from,
    to: payload.to,
    date: payload.date,
    time: payload.time,
    reason: payload.reason,
  };

  await emailjs.send(serviceId, templateId, params, {
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  });
}
