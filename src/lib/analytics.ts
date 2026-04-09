/* ─── Centralized analytics helper ──────────────────────────── */

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.gtag?.(...args);
}

/* ─── Event catalogue ──────────────────────────────────────── */

export function trackReservationSubmit(params: {
  from: string;
  to: string;
  vehicleType: string;
  price?: number | null;
}) {
  gtag("event", "reservation_submit", params);
}

export function trackReservationLookup() {
  gtag("event", "reservation_lookup");
}

export function trackCancelRequest(code: string) {
  gtag("event", "cancel_request", { code });
}

export function trackWhatsAppClick(location: string) {
  gtag("event", "whatsapp_click", { location });
}

export function trackWizardStep(step: number) {
  gtag("event", "wizard_step", { step });
}
