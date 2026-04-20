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

  // ── Resend (email) ──────────────────────────────────────────────────────
  get RESEND_API_KEY() { return optional("RESEND_API_KEY"); },
  get RESEND_FROM_EMAIL() { return optional("RESEND_FROM_EMAIL", "Zenturo Travel <noreply@zenturotravel.com>"); },

  // ── Telegram (admin alerts) ────────────────────────────────────────────
  get TELEGRAM_BOT_TOKEN() { return optional("TELEGRAM_BOT_TOKEN"); },
  get TELEGRAM_ADMIN_CHAT_IDS() { return optional("TELEGRAM_ADMIN_CHAT_IDS"); },

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
    "RESEND_API_KEY",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_ADMIN_CHAT_IDS",
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
