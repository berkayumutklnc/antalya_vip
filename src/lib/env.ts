/**
 * Runtime environment validation.
 *
 * Imported once at application start (layout / instrumentation).
 * Fails fast with a clear message when required vars are missing.
 */

function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`[env] Missing required env var: ${name}`);
  return val;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

// ---------------------------------------------------------------------------
// Server-only (validated at import time in server context)
// ---------------------------------------------------------------------------

export const env = {
  /** True when running in the Node server (API routes, SSR) */
  isServer: typeof window === "undefined",

  // ── Firebase Admin ──────────────────────────────────────────────────────
  get FIREBASE_SERVICE_ACCOUNT_BASE64() {
    return required("FIREBASE_SERVICE_ACCOUNT_BASE64");
  },

  // ── EmailJS (server) ───────────────────────────────────────────────────
  get EMAILJS_SERVICE_ID() { return optional("EMAILJS_SERVICE_ID"); },
  get EMAILJS_PUBLIC_KEY() { return optional("EMAILJS_PUBLIC_KEY"); },
  get EMAILJS_PRIVATE_KEY() { return optional("EMAILJS_PRIVATE_KEY"); },
  get EMAILJS_TEMPLATE_ID() { return optional("EMAILJS_TEMPLATE_ID"); },
  get EMAILJS_ASSIGN_TEMPLATE_ID() { return optional("EMAILJS_ASSIGN_TEMPLATE_ID"); },
  get EMAILJS_CANCEL_TEMPLATE_ID() { return optional("EMAILJS_CANCEL_TEMPLATE_ID"); },

  // ── Public vars (safe to read anywhere) ────────────────────────────────
  NEXT_PUBLIC_SITE_URL: optional("NEXT_PUBLIC_SITE_URL", "https://zenturotravel.com"),
  NEXT_PUBLIC_GA_ID: optional("NEXT_PUBLIC_GA_ID"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: optional("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  NEXT_PUBLIC_ADMIN_UID: optional("NEXT_PUBLIC_ADMIN_UID"),

  NODE_ENV: optional("NODE_ENV", "development"),
} as const;

// ---------------------------------------------------------------------------
// Startup health check — call from server entry
// ---------------------------------------------------------------------------

/** Validate that all required server env vars are present. Logs warnings for optional missing ones. */
export function validateServerEnv(): void {
  const missing: string[] = [];
  const warn: string[] = [];

  // required
  for (const name of ["FIREBASE_SERVICE_ACCOUNT_BASE64"]) {
    if (!process.env[name]) missing.push(name);
  }

  // warn-if-missing (degraded but functional)
  for (const name of [
    "EMAILJS_SERVICE_ID",
    "EMAILJS_PUBLIC_KEY",
    "EMAILJS_PRIVATE_KEY",
    "NEXT_PUBLIC_GA_ID",
    "NEXT_PUBLIC_ADMIN_UID",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]) {
    if (!process.env[name]) warn.push(name);
  }

  if (warn.length) {
    console.warn(`[env] Optional vars missing (degraded functionality): ${warn.join(", ")}`);
  }

  if (missing.length) {
    const msg = `[env] FATAL — required env vars missing: ${missing.join(", ")}`;
    console.error(msg);
    if (process.env.NODE_ENV === "production") {
      throw new Error(msg);
    }
  }
}
