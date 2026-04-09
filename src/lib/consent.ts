"use client";

const CONSENT_KEY = "zenturo_consent";

export type ConsentValue = "granted" | "denied";

export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CONSENT_KEY);
  if (v === "granted" || v === "denied") return v;
  return null;
}

export function setConsent(value: ConsentValue) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, value);

  // Update GA consent mode
  window.gtag?.("consent", "update", {
    analytics_storage: value,
  });
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
