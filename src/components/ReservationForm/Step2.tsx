"use client";

import { useState } from "react";
import type { VehicleType } from "@/types";
import { useI18nPublic } from "@/lib/i18n-public";

type FormData = {
  firstName: string;
  lastName: string;
  lang?: "de" | "en" | "tr" | "ru";
  from?: string;
  to?: string;
  phone?: string;
  email?: string;
  date?: string;
  time?: string;
  adults?: number;
  babySeat?: number;
  vehicleType?: VehicleType;
  price?: number | null;
};

type Props = {
  formData: FormData;
  updateData: (patch: Partial<FormData>) => void;
  prevStep: () => void;
  nextStep: () => void;
};

export default function Step2({ formData, updateData, prevStep, nextStep }: Props) {
  const { t } = useI18nPublic();
  const [touched, setTouched] = useState({ firstName: false, lastName: false });

  const firstNameOk = (formData.firstName || "").trim().length >= 2;
  const lastNameOk  = (formData.lastName  || "").trim().length >= 2;
  const allOk = firstNameOk && lastNameOk;

  function set(field: keyof FormData, val: any) {
    updateData({ [field]: val });
    if (field === "firstName" || field === "lastName") {
      const fn = field === "firstName" ? val : formData.firstName || "";
      const ln = field === "lastName"  ? val : formData.lastName  || "";
      const full = `${fn} ${ln}`.trim();
      updateData({ fullName: full } as any); 
    }
  }

  function onNext() {
    if (!allOk) return;
    nextStep();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("step2.title")}</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-white/80">{t("step2.firstName")}</label>
          <input
            type="text"
            value={formData.firstName || ""}
            onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
            onChange={(e) => set("firstName", e.target.value)}
            className={`w-full rounded-lg border bg-black px-3 py-2 text-white outline-none ${
              touched.firstName && !firstNameOk ? "border-red-500" : "border-white/15 focus:border-blue-500"
            }`}
            placeholder={t("step2.firstName")}
          />
          {touched.firstName && !firstNameOk && (
            <p className="mt-1 text-xs text-red-400">{t("step2.minChars")}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/80">{t("step2.lastName")}</label>
          <input
            type="text"
            value={formData.lastName || ""}
            onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
            onChange={(e) => set("lastName", e.target.value)}
            className={`w-full rounded-lg border bg-black px-3 py-2 text-white outline-none ${
              touched.lastName && !lastNameOk ? "border-red-500" : "border-white/15 focus:border-blue-500"
            }`}
            placeholder={t("step2.lastName")}
          />
          {touched.lastName && !lastNameOk && (
            <p className="mt-1 text-xs text-red-400">{t("step2.minChars")}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          className="rounded-lg bg-white/10 px-6 py-2 text-white hover:bg-white/20"
        >
          {t("step2.back")}
        </button>
        <button
          onClick={onNext}
          disabled={!allOk}
          className={`rounded-lg px-6 py-2 font-semibold ${
            allOk ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white/10 text-white/50 cursor-not-allowed"
          }`}
        >
          {t("step2.next")}
        </button>
      </div>
    </div>
  );
}
