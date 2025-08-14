// src/components/ReservationForm/ReservationContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { ReservationFormData } from "@/types/reservation";
import { useI18nPublic } from "@/lib/i18n-public";

const makeDefault = (lang: ReservationFormData["lang"]): ReservationFormData => ({
  lang,
  from: "",
  to: "",
  date: "",
  time: "",
  adults: 1,
  babySeat: 0,

  fullName: "",
  phone: "",
  email: "",

  flightNo: "",
  terminal: "",
  baggageCount: 0,

  vehicleType: undefined, // henüz seçili değil
  price: 0,

  note: "",
  acceptPolicy: false,
  acceptKvkk: false,
  acceptComms: false,
});

const Ctx = createContext<{
  form: ReservationFormData;
  setForm: (patch: Partial<ReservationFormData>) => void;
  reset: () => void;
}>({
  form: makeDefault("de"),
  setForm: () => {},
  reset: () => {},
});

export const useReservation = () => useContext(Ctx);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18nPublic();
  const [form, setFormState] = useState<ReservationFormData>(makeDefault(lang));

  useEffect(() => {
    setFormState((prev) => ({ ...prev, lang }));
  }, [lang]);

  function setForm(patch: Partial<ReservationFormData>) {
    setFormState((prev) => ({ ...prev, ...patch }));
  }
  function reset() {
    setFormState(makeDefault(lang));
  }

  return <Ctx.Provider value={{ form, setForm, reset }}>{children}</Ctx.Provider>;
}
