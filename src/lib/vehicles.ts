'use client';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import type { Vehicle, VehicleType } from "@/types";

export type VehicleBlockSlot = {
  startAt: number;
  endAt: number;
  reason?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  plate?: string | null;
  type?: VehicleType | null;
  updatedAt?: number;
};

function now() { return Date.now(); }

function toVehicle(raw: any, id: string): Vehicle {
  const v: any = {
    id,
    type: raw?.type ?? null,
    plate: raw?.plate ?? null,
    driverName: raw?.driverName ?? null,
    driverPhone: raw?.driverPhone ?? null,
    capacity: raw?.capacity ?? null,
    blockedSlots: Array.isArray(raw?.blockedSlots) ? raw.blockedSlots : [],
    createdAt:
      typeof raw?.createdAt === "number"
        ? raw.createdAt
        : raw?.createdAt?.toMillis
        ? raw.createdAt.toMillis()
        : 0,
    updatedAt:
      typeof raw?.updatedAt === "number"
        ? raw.updatedAt
        : raw?.updatedAt?.toMillis
        ? raw.updatedAt.toMillis()
        : 0,
  };
  return v as Vehicle;
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const snap = await getDocs(query(collection(getClientDb(), "vehicles")));
  return snap.docs.map(d => toVehicle(d.data(), d.id));
}

export type UpsertVehicleInput = {
  id: string;
  type?: VehicleType | null;
  plate?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  capacity?: number | null;
};

export async function createVehicle(input: UpsertVehicleInput) {
  const id = input.id.trim();
  if (!id) throw new Error("Araç ID zorunludur.");
  const ref = doc(getClientDb(), "vehicles", id);
  await setDoc(ref, {
    id,
    type: input.type ?? null,
    plate: input.plate ?? null,
    driverName: input.driverName ?? null,
    driverPhone: input.driverPhone ?? null,
    capacity: input.capacity ?? null,
    blockedSlots: [],
    createdAt: now(),
    updatedAt: now(),
  }, { merge: true });
}

export async function updateVehicle(input: UpsertVehicleInput) {
  const id = input.id.trim();
  if (!id) throw new Error("Araç ID zorunludur.");
  const ref = doc(getClientDb(), "vehicles", id);
  await updateDoc(ref, {
    type: input.type ?? null,
    plate: input.plate ?? null,
    driverName: input.driverName ?? null,
    driverPhone: input.driverPhone ?? null,
    capacity: input.capacity ?? null,
    updatedAt: now(),
  } as any);
}

export async function deleteVehicle(id: string) {
  const ref = doc(getClientDb(), "vehicles", id);
  await deleteDoc(ref);
}

export async function addVehicleBlockSlot(vehicleId: string, slot: VehicleBlockSlot) {
  if (!slot.startAt || !slot.endAt || slot.endAt <= slot.startAt) {
    throw new Error("Geçersiz zaman aralığı.");
  }
  const ref = doc(getClientDb(), "vehicles", vehicleId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Araç bulunamadı.");
  const v = snap.data() as any;
  const list: VehicleBlockSlot[] = Array.isArray(v.blockedSlots) ? v.blockedSlots.slice() : [];
  list.push({ ...slot, updatedAt: now() });
  await updateDoc(ref, { blockedSlots: list, updatedAt: now() } as any);
}

export async function removeVehicleBlockSlot(vehicleId: string, index: number) {
  const ref = doc(getClientDb(), "vehicles", vehicleId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Araç bulunamadı.");
  const v = snap.data() as any;
  const list: VehicleBlockSlot[] = Array.isArray(v.blockedSlots) ? v.blockedSlots.slice() : [];
  if (index < 0 || index >= list.length) throw new Error("Geçersiz indeks.");
  list.splice(index, 1);
  await updateDoc(ref, { blockedSlots: list, updatedAt: now() } as any);
}
