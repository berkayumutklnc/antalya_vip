"use client";

import AdminGate from "@/components/AdminGate";

export default function MigrateBlockedSlotsPage() {
  return (
    <AdminGate>
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-3">Migrate blockedSlots</h1>
        <p className="text-white/60">
          Bu migrasyon aracına artık ihtiyaç yoktur. Supabase&apos;de blocked_slots ayrı bir
          tablo olarak tasarlanmıştır ve eski gömülü dizi formatı kullanılmamaktadır.
        </p>
      </div>
    </AdminGate>
  );
}
