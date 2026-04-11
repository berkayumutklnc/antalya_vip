"use client";

import { useEffect, useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import { useI18nPublic } from "@/lib/i18n-public";
import { trackReservationSubmit, trackWizardStep } from "@/lib/analytics";
import type { VehicleType } from "@/types";

type FormShape = {
  lang: "de" | "en" | "tr" | "ru";
  from: string;
  to: string;
  date: string;
  time: string; 
  adults: number;
  babySeat: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicleType?: VehicleType; 
  price?: number | null;
};

const makeInitial = (lang: FormShape["lang"]): FormShape => ({
  lang,
  from: "",
  to: "",
  date: "",
  time: "",
  adults: 1,
  babySeat: 0,
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  vehicleType: undefined,
  price: undefined,
});

export default function Wizard() {
  const { lang } = useI18nPublic();

  const [step, setStep] = useState(1);
  const [formData, setFormDataState] = useState<FormShape>(makeInitial(lang));
  const [rid, setRid] = useState<string | null>(null);
  const [pnr, setPnr] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    setFormDataState((prev) => ({ ...prev, lang }));
  }, [lang]);

  const setFormData = (patch: Partial<FormShape>) =>
    setFormDataState((prev) => ({ ...prev, ...patch }));

  const nextStep = () => setStep((s) => { const next = Math.min(4, s + 1); trackWizardStep(next); return next; });
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: formData.from,
          to: formData.to,
          date: formData.date,
          time: formData.time,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          email: formData.email,
          lang: formData.lang,
          adults: formData.adults,
          babySeat: formData.babySeat,
          vehicleType: formData.vehicleType,
          acceptPolicy: true,
          acceptKvkk: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Server error");
      }

      const data = await res.json();
      setRid(data.id);
      setPnr(data.code ?? data.id);
      setSubmitted(true);
      trackReservationSubmit({
        from: formData.from,
        to: formData.to,
        vehicleType: formData.vehicleType || "unknown",
        price: formData.price,
      });
      window?.scrollTo?.({ top: 0, behavior: "smooth" });
    } catch {
      alert("Rezervasyon oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {step <= 4 && !submitted && (
        <div className="mb-8 flex items-center justify-center">
          {[1, 2, 3, 4].map((n, i) => (
            <div key={n} className="flex items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                  step > n
                    ? "bg-blue-600 text-white"
                    : step === n
                    ? "bg-blue-600 text-white ring-4 ring-blue-600/20"
                    : "border border-white/20 text-white/40"
                }`}
              >
                {step > n ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  n
                )}
              </div>
              {i < 3 && (
                <div className={`mx-2 h-0.5 w-8 sm:w-12 rounded transition-colors duration-300 ${
                  step > n ? "bg-blue-600" : "bg-white/15"
                }`} />
              )}
            </div>
          ))}
        </div>
      )}
      <div key={step} className="animate-fadeIn">
      {step === 1 ? (
        <Step1 formData={formData} updateData={setFormData} nextStep={nextStep} />
      ) : step === 2 ? (
        <Step2
          formData={formData}
          updateData={setFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      ) : step === 3 ? (
        <Step3
          formData={formData}
          updateData={setFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      ) : (
        <Step4
          formData={formData}
          prevStep={prevStep}
          onSubmit={submit}
          submitted={submitted}
          pnr={pnr}
          rid={rid}
          updateData={setFormData}
        />
      )}
      </div>
    </div>
  );
}
