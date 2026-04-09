import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { PublicLookupSchema } from "@/lib/validation/publicLookup";
import { publicLookupLimiter, getClientIp } from "@/lib/server/rateLimit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Rate limiting
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
    const adminDb = getAdminDbOrThrow();

    const snap = await adminDb.collection("reservations").doc(normCode).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const d = snap.data()!;
    if (String(d.email || "").toLowerCase() !== normMail) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Hardened public response — only fields the customer needs
    const isConfirmed = d.status === "confirmed";

    return NextResponse.json({
      id: snap.id,
      code: d.code ?? snap.id,
      status: d.status ?? "pending",
      from: d.from ?? "",
      to: d.to ?? "",
      date: d.date ?? "",
      time: d.time ?? "",
      startAt: d.startAt ?? null,
      email: d.email ?? "",
      fullName: d.fullName ?? "",
      phone: d.phone ?? "",
      vehicleType: d.vehicleType ?? null,
      // Only expose driver info when reservation is confirmed
      plate: isConfirmed ? (d.plate ?? null) : null,
      driverName: isConfirmed ? (d.driverName ?? null) : null,
      driverPhone: isConfirmed ? (d.driverPhone ?? null) : null,
      cancel: d.cancel ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
