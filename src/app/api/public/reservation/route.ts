import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { PublicLookupSchema } from "@/lib/validation/publicLookup";
import { publicLookupLimiter, getClientIp } from "@/lib/server/rateLimit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!publicLookupLimiter.check(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = PublicLookupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { code: normCode, email: normMail } = parsed.data;
    const db = getAdminClient();

    const { data: d } = await db
      .from("reservations")
      .select("*")
      .eq("code", normCode)
      .maybeSingle();

    if (!d) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (String(d.email || "").toLowerCase() !== normMail) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const isConfirmed = d.status === "confirmed";

    return NextResponse.json({
      id: d.code,
      code: d.code,
      status: d.status ?? "pending",
      from: d.from ?? "",
      to: d.to ?? "",
      date: d.date ?? "",
      time: d.time ?? "",
      startAt: d.start_at ?? null,
      email: d.email ?? "",
      fullName: d.full_name ?? "",
      phone: d.phone ?? "",
      vehicleType: d.vehicle_type ?? null,
      plate: isConfirmed ? (d.plate ?? null) : null,
      driverName: isConfirmed ? (d.driver_name ?? null) : null,
      driverPhone: isConfirmed ? (d.driver_phone ?? null) : null,
      cancel: d.cancel_requested ? {
        requested: d.cancel_requested,
        reason: d.cancel_reason,
        requestedAt: d.cancel_requested_at,
        canceledAt: d.cancel_canceled_at,
      } : null,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
