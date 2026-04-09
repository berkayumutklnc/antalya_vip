# Zenturo Travel — Launch Checklist

> Updated: RC Closure Phase. See also `docs/prelaunch-blockers.md` for
> detailed external blocker inventory and `docs/smoke-test.md` for
> post-deploy verification.

## Pre-launch Blockers (Require Business Input)

- [ ] **Firebase env vars** — all 7 client keys + 1 server key (see `docs/prelaunch-blockers.md` §1)
- [ ] **NEXT_PUBLIC_ADMIN_UID** — Firebase UID for admin access
- [ ] **EmailJS credentials** — 6 server-side vars for email notifications
- [ ] **NEXT_PUBLIC_GA_ID** — Google Analytics 4 measurement ID
- [ ] **Legal page review** — Business owner must review `/datenschutz`, `/impressum`, `/agb` for accuracy
- [ ] **Cancellation window alignment** — AGB says 24h, code enforces 12h — business decision required
- [ ] **Domain DNS & SSL** — zenturotravel.com must point to hosting

## Technical Checklist (All Complete)

### Security
- [x] Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS
- [x] `poweredByHeader: false` in next.config
- [x] HTTPS redirect in middleware (production)
- [x] `anonymize_ip: true` in GA config
- [x] GA consent mode gate (analytics_storage default denied until user accepts)
- [x] Consent banner with accept/deny (GDPR compliant)
- [x] Firebase admin SDK in production dependencies
- [x] Firebase client env vars validated at runtime (no `!` assertions)

### Testing
- [x] Vitest test infrastructure configured
- [x] 61 unit tests: pricing, reservation state machine, places, transfer routes
- [x] Smoke test checklist documented (`docs/smoke-test.md`)

### Analytics
- [x] Centralized `src/lib/analytics.ts` event helper
- [x] Events wired: reservation_submit, reservation_lookup, cancel_request, whatsapp_click, wizard_step
- [x] GA consent mode: default denied → granted on user accept
- [x] No analytics data collected without explicit consent

### Error Handling
- [x] `src/app/error.tsx` — global error boundary
- [x] `src/app/not-found.tsx` — 404 page (German)
- [x] `src/app/loading.tsx` — loading spinner

### Environment & Config
- [x] `src/lib/env.ts` — runtime env validation with fail-fast in production
- [x] `src/lib/firebase.ts` — client env vars validated with clear error messages
- [x] `src/instrumentation.ts` — validates env on server start
- [x] `.env.example` — documents all env vars

### Code Hygiene
- [x] Dead `src/lib/email.ts` (client-side EmailJS) removed
- [x] Dead `src/lib/reservations.ts` (@deprecated) removed
- [x] Dead `src/components/WhatsAppButton.tsx` removed
- [x] Dead `src/app/legal/impressum.tsx` (duplicate) removed
- [x] Dead dependencies removed: `@emailjs/browser`, `@fullcalendar/*`
- [x] OG image: dynamic generation via `opengraph-image.tsx` (removed reference to non-existent `/og.jpg`)
- [x] WhatsAppFab wired into layout (was defined but never rendered)

## Known Technical Debt (Non-blocking)

- **`?lang=` query param i18n** — Temporary. Should be path-based or middleware-based locale detection.
- **No E2E / integration tests** — Only unit tests. Consider Playwright for critical flows.
- **No structured server logging** — Console-based with tag conventions. Adequate for Vercel.
- **Platform-specific npm packages** — `@tailwindcss/oxide-linux-x64-gnu` and `lightningcss-linux-x64-gnu` in dependencies for Linux CI builds. Harmless on other platforms via optional deps.

## Final Go-Live Verdict

**Conditionally ready** — all technical blockers are closed. Go-live requires only
external business inputs listed above (env vars, legal review, DNS).
