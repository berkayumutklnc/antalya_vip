import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";

const adminDb = getAdminDbOrThrow();
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      return NextResponse.json({ error: "Missing code or email" }, { status: 400 });
    }

    const normCode = String(code).trim().toUpperCase();
    const normMail = String(email).trim().toLowerCase();

    if (!/^TRF-\w{3,}$/.test(normCode)) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    const snap = await adminDb.collection("reservations").doc(normCode).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const d = snap.data() as any;
    if (String(d.email || "").toLowerCase() !== normMail) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

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
      plate: d.plate ?? null,
      driverName: d.driverName ?? null,
      driverPhone: d.driverPhone ?? null,
      cancel: d.cancel ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
