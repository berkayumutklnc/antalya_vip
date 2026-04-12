'use client';
import { getSupabaseClient } from "@/lib/supabase";
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

async function authHeaders(): Promise<HeadersInit> {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
}

async function apiJson<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

function toVehicle(raw: any): Vehicle {
  return {
    id: raw.id,
    type: raw.type ?? null,
    plate: raw.plate ?? null,
    driverName: raw.driverName ?? null,
    driverPhone: raw.driverPhone ?? null,
    capacity: raw.capacity ?? null,
    blockedSlots: Array.isArray(raw.blockedSlots) ? raw.blockedSlots : [],
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : 0,
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
  } as Vehicle;
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const headers = await authHeaders();
  const data = await apiJson<{ items: any[] }>("/api/admin/vehicles", { headers });
  return (data.items || []).map(toVehicle);
}

export type UpsertVehicleInput = {
  id?: string;
  type?: VehicleType | null;
  plate?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  capacity?: number | null;
};

export async function createVehicle(input: UpsertVehicleInput) {
  const headers = await authHeaders();
  return apiJson("/api/admin/vehicles", {
    method: "POST",
    headers,
    body: JSON.stringify({
      plate: input.plate ?? "",
      type: input.type ?? "",
      driverName: input.driverName ?? "",
      driverPhone: input.driverPhone ?? "",
    }),
  });
}

export async function updateVehicle(input: UpsertVehicleInput) {
  if (!input.id) throw new Error("Araç ID zorunludur.");
  const headers = await authHeaders();
  return apiJson(`/api/admin/vehicles/${input.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      plate: input.plate ?? "",
      type: input.type ?? "",
      driverName: input.driverName ?? "",
      driverPhone: input.driverPhone ?? "",
    }),
  });
}

export async function deleteVehicle(id: string) {
  const headers = await authHeaders();
  return apiJson(`/api/admin/vehicles/${id}`, { method: "DELETE", headers });
}

export async function addVehicleBlockSlot(vehicleId: string, slot: VehicleBlockSlot) {
  if (!slot.startAt || !slot.endAt || slot.endAt <= slot.startAt) {
    throw new Error("Geçersiz zaman aralığı.");
  }
  const headers = await authHeaders();
  return apiJson(`/api/admin/vehicles/${vehicleId}/slots`, {
    method: "POST",
    headers,
    body: JSON.stringify({ startAt: slot.startAt, endAt: slot.endAt, reason: slot.reason ?? "manual" }),
  });
}

export async function removeVehicleBlockSlot(vehicleId: string, index: number) {
  const headers = await authHeaders();
  return apiJson(`/api/admin/vehicles/${vehicleId}/slots?index=${index}`, {
    method: "DELETE",
    headers,
  });
}
