import { NextResponse } from "next/server";
import { getAdminDbOrThrow } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
const adminDb = getAdminDbOrThrow();
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { rid: string } }) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    if (!["pending", "confirmed", "canceled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const rid = params.rid;
    const rRef = adminDb.collection("reservations").doc(rid);
    const rSnap = await rRef.get();
    if (!rSnap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const r = rSnap.data() as any;
    const slot = `${r.date}T${r.time}`; // "YYYY-MM-DDTHH:mm"
    const type = String(r.vehicleType || "").trim().toLowerCase();

    if (status === "confirmed") {
      // 1) uygun aracı bul
      const all = await adminDb.collection("vehicles").get();
      const candidates = all.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .filter(v => String(v.type || "").trim().toLowerCase() === type);

      const picked = candidates.find(v => {
        const arr: string[] = Array.isArray(v.blockedSlots) ? v.blockedSlots : [];
        return !arr.includes(slot);
      });

      if (!picked) {
        return NextResponse.json({ error: "No available vehicle for this slot" }, { status: 409 });
      }

      const vRef = adminDb.collection("vehicles").doc(picked.id);
      await adminDb.runTransaction(async (tx) => {
        const freshV = await tx.get(vRef);
        const data = freshV.data() as any;
        const arr: string[] = Array.isArray(data?.blockedSlots) ? data.blockedSlots : [];
        if (arr.includes(slot)) throw new Error("Vehicle just became unavailable");

        tx.update(vRef, { blockedSlots: FieldValue.arrayUnion(slot) });
        tx.update(rRef, {
          status: "confirmed",
          vehicleId: picked.id,
          plate: picked.plate || "",
          driverName: picked.driverName || "",
          driverPhone: picked.driverPhone || "",
        });
      });

      return NextResponse.json({ ok: true, assignedVehicleId: picked.id });
    }

    if (status === "canceled") {
      const vId = r.vehicleId;
      if (vId) {
        const vRef = adminDb.collection("vehicles").doc(vId);
        await adminDb.runTransaction(async (tx) => {
          tx.update(vRef, { blockedSlots: FieldValue.arrayRemove(slot) });
          tx.update(rRef, { status: "canceled" });
        });
      } else {
        await rRef.update({ status: "canceled" });
      }
      return NextResponse.json({ ok: true });
    }

    // pending'e dönüş vb.
    await rRef.update({ status });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
