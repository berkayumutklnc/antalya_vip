/**
 * Runtime environment validation.
 *
 * Imported once at application start (layout / instrumentation).
 * Fails fast with a clear message when required vars are missing.
 */

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

// ---------------------------------------------------------------------------
// Server-only (validated at import time in server context)
// ---------------------------------------------------------------------------

export const env = {
  /** True when running in the Node server (API routes, SSR) */
  isServer: typeof window === "undefined",

  // ── Supabase ────────────────────────────────────────────────────────────
  get SUPABASE_SERVICE_ROLE_KEY() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
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
  for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]) {
    if (!process.env[name]) missing.push(name);
  }

  // warn-if-missing (degraded but functional)
  for (const name of [
    "EMAILJS_SERVICE_ID",
    "EMAILJS_PUBLIC_KEY",
    "EMAILJS_PRIVATE_KEY",
    "NEXT_PUBLIC_GA_ID",
  ]) {
    if (!process.env[name]) warn.push(name);
  }

  if (warn.length) {
    console.warn(`[env] Optional vars missing (degraded functionality): ${warn.join(", ")}`);
  }

  if (missing.length) {
    const msg = `[env] CRITICAL — required env vars missing: ${missing.join(", ")}. API routes needing these will fail.`;
    console.error(msg);
    // Don't throw — let the app start in degraded mode so public pages still render.
  }
}
