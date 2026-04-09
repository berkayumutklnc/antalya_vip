"use client";

import Wizard from "@/components/ReservationForm/Wizard";
import { useI18nPublic } from "@/lib/i18n-public";

export default function ReservationPage() {
  const { t } = useI18nPublic();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">{t("rezervasyon.title")}</h1>
      <Wizard />
    </div>
  );
}
