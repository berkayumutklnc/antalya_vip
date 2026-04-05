'use client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import type { Reservation, Vehicle, VehicleType } from "@/types";
import {
  sendReservationMail,
  sendCancelRequestMail,
  sendAssignMail,
} from "@/lib/email";
import { istToUtcMs, addMinutes } from "@/utils/time";
import { stripUndefined } from "@/utils/fire";

const now = () => Date.now();

function genTRF(): string {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `TRF-${n}`;
}

export async function adminCancel(reservationId: string, reason?: string) {
  await updateDoc(doc(getClientDb(), "reservations", reservationId), {
    status: "canceled",
    cancel: {
      requested: false,
      reason: reason || null,
      requestedAt: null,
      canceledAt: Date.now(),
    },
    updatedAt: Date.now(),
  } as any);

  await updateDoc(doc(getClientDb(), "reservations_public", reservationId), {
    status: "canceled",
    updatedAt: Date.now(),
  } as any);
}
function overlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}
function toReservation(d: any, docId: string): Reservation {
  const safeId = (d?.id && String(d.id).trim()) || docId;
  const safeCode = (d?.code && String(d.code).trim()) || safeId;

  const rawCancel = d?.cancel;
  const cancel =
    rawCancel && typeof rawCancel === "object"
      ? {
          requested: Boolean(rawCancel.requested ?? false),
          reason: rawCancel.reason ?? null,
          requestedAt:
            rawCancel.requestedAt == null ? null : Number(rawCancel.requestedAt),
          canceledAt:
            rawCancel.canceledAt == null ? null : Number(rawCancel.canceledAt),
        }
      : null;

  return {
    id: safeId,
    code: safeCode,
    from: d?.from ?? "",
    to: d?.to ?? "",
    date: d?.date ?? "",
    time: d?.time ?? "",
    startAt: d?.startAt == null ? null : Number(d.startAt),
    fullName: d?.fullName ?? "",
    phone: d?.phone ?? "",
    email: d?.email ?? "",
    status: (d?.status as any) ?? "pending",
    adults: Number(d?.adults ?? 1),
    babySeat: Number(d?.babySeat ?? 0),
    vehicleType: d?.vehicleType ?? null,
    vehicleId: d?.vehicleId ?? null,
    plate: d?.plate ?? null,
    driverName: d?.driverName ?? null,
    driverPhone: d?.driverPhone ?? null,
    price: d?.price == null ? null : Number(d.price),
    createdAt:
      typeof d?.createdAt === "number"
        ? d.createdAt
        : d?.createdAt?.toMillis
        ? d.createdAt.toMillis()
        : 0,
    updatedAt:
      typeof d?.updatedAt === "number"
        ? d.updatedAt
        : d?.updatedAt?.toMillis
        ? d.updatedAt.toMillis()
        : 0,
    lang: d?.lang ?? "tr",
    cancel, 
  } as Reservation;
}

export type CreateReservationInput = {
  from: string;
  to: string;
  date: string;
  time: string;
  startAt?: number | null;
  fullName: string;
  phone: string;
  email: string;
  lang?: "de" | "en" | "tr" | "ru";
  adults?: number;
  babySeat?: number;
  vehicleType?: VehicleType;
  price?: number | null;
  flightNo?: string | null;
  terminal?: string | null;
  baggageCount?: number | null;
  note?: string | null;
  acceptPolicy?: boolean;
  acceptKvkk?: boolean;
  acceptComms?: boolean;
};

export async function createReservation(form: CreateReservationInput) {
  const code = genTRF();
  const createdAt = now();

  let startAt = form.startAt ?? null;
  if (startAt == null) {
    const [y, m, d] = form.date.split("-").map(Number);
    const [H, M] = form.time.split(":").map(Number);
    startAt = Date.UTC(y, m - 1, d, H, M);
  }

  const payload = stripUndefined({
    id: code,
    code,
    from: form.from,
    to: form.to,
    date: form.date,
    time: form.time,
    startAt,
    fullName: form.fullName,
    phone: form.phone,
    email: form.email.toLowerCase(),
    status: "pending" as const,
    adults: Number(form.adults ?? 1),
    babySeat: Number(form.babySeat ?? 0),
    vehicleType: form.vehicleType ?? null,
    price:
      form.price === null || form.price === undefined
        ? null
        : Number(form.price),
    createdAt,
    updatedAt: createdAt,
    lang: form.lang ?? "tr",
    cancel: { requested: false, reason: null, requestedAt: null, canceledAt: null },
    flightNo: form.flightNo ?? null,
    terminal: form.terminal ?? null,
    baggageCount: form.baggageCount ?? null,
    note: form.note ?? null,
    acceptPolicy: form.acceptPolicy ?? false,
    acceptKvkk: form.acceptKvkk ?? false,
    acceptComms: form.acceptComms ?? false,
  });

  await setDoc(doc(getClientDb(), "reservations", code), payload, { merge: true });

  await setDoc(doc(getClientDb(), "pnr", code), { rid: code, createdAt }, { merge: true });

  await setDoc(
    doc(getClientDb(), "reservations_public", code),
    stripUndefined({
      code,
      email: payload.email,
      status: payload.status,
      from: payload.from,
      to: payload.to,
      date: payload.date,
      time: payload.time,
      startAt,
      vehicleType: payload.vehicleType ?? null,
      driver: null,
      createdAt,
      updatedAt: createdAt,
    }),
    { merge: true }
  );

  try {
    await sendReservationMail(payload);
  } catch (e) {
  }

  return { id: code, code };
}

export async function getReservation(id: string): Promise<Reservation | null> {
  const snap = await getDoc(doc(getClientDb(), "reservations", id));
  if (!snap.exists()) return null;
  return toReservation(snap.data(), snap.id);
}

export async function getReservationByCode(code: string): Promise<Reservation | null> {
  try {
    const pSnap = await getDoc(doc(getClientDb(), "pnr", code));
    if (pSnap.exists()) {
      const rid = (pSnap.data() as any)?.rid;
      if (rid) return await getReservation(rid);
    }
  } catch {}
  const qy = query(collection(getClientDb(), "reservations"), where("code", "==", code));
  const snap = await getDocs(qy);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return toReservation(d.data(), d.id);
}

export async function listReservations(): Promise<Reservation[]> {
  const qy = query(collection(getClientDb(), "reservations"), orderBy("createdAt", "desc"));
  const snap = await getDocs(qy);
  return snap.docs.map((d) => toReservation(d.data(), d.id));
}

export async function assignVehicle(
  reservationId: string,
  vehicle: Vehicle,
  slotMinutes = 60
) {
  const rRef = doc(getClientDb(), "reservations", reservationId);
  const vRef = doc(getClientDb(), "vehicles", vehicle.id);

  const [rSnap, vSnap] = await Promise.all([getDoc(rRef), getDoc(vRef)]);
  if (!rSnap.exists()) throw new Error("Rezervasyon bulunamadı.");
  if (!vSnap.exists()) throw new Error("Araç bulunamadı.");

  const r = toReservation(rSnap.data(), rSnap.id);

  if (r.status === "canceled") {
    throw new Error("İptal edilmiş rezervasyona araç atanamaz.");
  }
  if (r.cancel?.requested) {
    throw new Error("Müşteri iptal talebi var. Onaylanana kadar araç ataması kapalı.");
  }
  if (r.status !== "pending") {
    throw new Error("Sadece bekleyen rezervasyonlara araç atanabilir.");
  }

  const v = vSnap.data() as Vehicle;

  const startAt = r.startAt || istToUtcMs(r.date, r.time);
  if (!startAt) throw new Error("Rezervasyon saati eksik.");
  const endAt = addMinutes(startAt, slotMinutes);

  const slots = Array.isArray(v.blockedSlots) ? v.blockedSlots : [];
  const clash = slots.some((s: any) =>
    overlap(Number(s.startAt), Number(s.endAt), startAt, endAt)
  );
  if (clash) throw new Error("Araç bu zaman aralığında dolu.");

  const batch = writeBatch(getClientDb());

  batch.update(
    rRef,
    stripUndefined({
      status: "confirmed",
      vehicleId: vehicle.id,
      vehicleType: (vehicle.type as VehicleType) ?? r.vehicleType ?? null,
      plate: vehicle.plate ?? null,
      driverName: vehicle.driverName ?? null,
      driverPhone: vehicle.driverPhone ?? null,
      updatedAt: now(),
    })
  );

  const newSlot = stripUndefined({
    startAt,
    endAt,
    reason: "admin-assign",
    driverName: vehicle.driverName ?? null,
    driverPhone: vehicle.driverPhone ?? null,
    plate: vehicle.plate ?? null,
    type: vehicle.type,
    updatedAt: now(),
  });

  batch.update(vRef, {
    blockedSlots: [...slots, newSlot],
    updatedAt: now(),
  });

  batch.set(
    doc(getClientDb(), "reservations_public", reservationId),
    stripUndefined({
      code: r.code ?? r.id,
      email: r.email,
      status: "confirmed",
      from: r.from,
      to: r.to,
      date: r.date,
      time: r.time,
      startAt,
      vehicleType: (vehicle.type as VehicleType) ?? r.vehicleType ?? null,
      driver: {
        name: vehicle.driverName ?? null,
        phone: vehicle.driverPhone ?? null,
        plate: vehicle.plate ?? null,
      },
      updatedAt: now(),
    }),
    { merge: true }
  );

  await batch.commit();

  try {
    await sendAssignMail({
      code: r.code ?? r.id,
      email: r.email,
      fullName: r.fullName,
      from: r.from,
      to: r.to,
      date: r.date,
      time: r.time,
      driverName: vehicle.driverName,
      driverPhone: vehicle.driverPhone,
      vehiclePlate: vehicle.plate,
    });
  } catch (e) {
  }
}

export async function requestCancel(reservationId: string, reason: string) {
  const ref = doc(getClientDb(), "reservations", reservationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Rezervasyon bulunamadı.");
  const r = toReservation(snap.data(), snap.id);

  if (r.status === "canceled") throw new Error("Rezervasyon zaten iptal edilmiş.");
  if (r.cancel?.requested) throw new Error("İptal talebi zaten mevcut.");

  await updateDoc(
    ref,
    {
      cancel: {
        requested: true,
        reason: (reason || "").trim() || null,
        requestedAt: now(),
        canceledAt: null,
      },
      updatedAt: now(),
    } as any
  );

  try {
    await sendCancelRequestMail({
      code: r.code ?? r.id,
      email: r.email,
      fullName: r.fullName,
      from: r.from,
      to: r.to,
      date: r.date,
      time: r.time,
      reason,
    });
  } catch (e) {
  }
}

export async function approveCancel(reservationId: string) {
  const ref = doc(getClientDb(), "reservations", reservationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Rezervasyon bulunamadı.");
  const r = toReservation(snap.data(), snap.id);

  await updateDoc(
    ref,
    {
      status: "canceled",
      cancel: {
        requested: false,
        reason: r.cancel?.reason ?? null,
        requestedAt: r.cancel?.requestedAt ?? null,
        canceledAt: now(),
      },
      updatedAt: now(),
    } as any
  );

  await updateDoc(
    doc(getClientDb(), "reservations_public", reservationId),
    {
      status: "canceled",
      updatedAt: now(),
      driver: null,
      vehicleId: null,
      vehicleType: r.vehicleType ?? null,
    } as any
  );
}

export async function rejectCancel(reservationId: string) {
  const ref = doc(getClientDb(), "reservations", reservationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Rezervasyon bulunamadı.");
  const r = toReservation(snap.data(), snap.id);

  if (!r.cancel?.requested) return;

  await updateDoc(
    ref,
    {
      cancel: {
        requested: false,
        reason: r.cancel?.reason ?? null,
        requestedAt: r.cancel?.requestedAt ?? null,
        canceledAt: null,
      },
      updatedAt: now(),
    } as any
  );
}
