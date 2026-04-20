# Pre-launch External Blockers

> Items below **cannot be resolved in code** — they require business decisions,
> provider configuration, or legal review. The application is technically
> functional once these are completed.

---

## 1. Environment Variables (Provider Config)

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client Supabase connection | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client Supabase anonymous key | Supabase Dashboard → Project Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin operations | Supabase Dashboard → Project Settings → API → `service_role` key (keep secret!) |
| `NEXT_PUBLIC_ADMIN_UID` | Admin dashboard access | Supabase Dashboard → Authentication → Users → copy UID of admin user |
| `RESEND_API_KEY` | Server-side email via Resend | Resend dashboard → API Keys |
| `RESEND_FROM_EMAIL` | Sender address for emails | e.g. `Zenturo Travel <noreply@zenturotravel.com>` (must verify domain in Resend) |
| `TELEGRAM_BOT_TOKEN` | Admin Telegram alerts | BotFather → /newbot → copy token |
| `TELEGRAM_ADMIN_CHAT_IDS` | Comma-separated Telegram chat IDs | Message bot, use /getUpdates to find chat_id |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 | GA4 Admin → Data Streams → Measurement ID (G-XXXXXXXXXX) |

### Optional (have working defaults)

| Variable | Default | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://zenturotravel.com` | Change only if deploying to different domain |
| `NEXT_PUBLIC_DEFAULT_LANG` | `de` | Site language default |
| `NEXT_PUBLIC_PHONE` | `+905541790203` | Company phone |
| `NEXT_PUBLIC_WHATSAPP` | `+905541790203` | WhatsApp number |
| `NEXT_PUBLIC_EMAIL` | `info@zenturotravel.com` | Contact email |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | Falls back to `NEXT_PUBLIC_WHATSAPP` | Override for WhatsApp FAB |

---

## 2. Legal Pages — Verification Required

All legal pages exist with real content. Business owner must **review and confirm accuracy**:

| Page | Route | Status | Action |
|------|-------|--------|--------|
| Datenschutzerklärung (Privacy) | `/datenschutz` | Content present, DSGVO structure | **Review**: confirm data processing details, DPO contact, GA cookie description match implementation |
| Impressum | `/impressum` | Content present, uses `SITE` config | **Review**: confirm company name, address, Handelsregister details |
| AGB (Terms) | `/agb` | Content present, 8 sections | **Review**: confirm pricing terms, 24h cancellation window matches code (code uses 12h) |
| Privacy Policy (i18n) | `/policies/privacy` | Content present | **Review**: KVKK compliance wording |
| Cancellation Policy (i18n) | `/policies/cancellation` | Content present | **Review**: confirm cancellation window matches code logic |

> **⚠️ AGB/Cancellation discrepancy**: AGB page states 24-hour free cancellation.
> Code enforces **12-hour** window (`canRequestCancel` in `reservationStatus.ts`).
> Business must decide which is correct and align both.

---

## 3. Contact / Business Identity

Configured in `src/config/site.ts` with current defaults:

| Field | Current Value | Action |
|-------|---------------|--------|
| Company name | Zenturo Travel | Confirm legal entity name |
| Short name | Zenturo | Confirm |
| Legal name | Zenturo Travel GmbH | Confirm — is this the registered entity? |
| Address | Güzeloba Mahallesi, Lara Caddesi No: 24, Muratpaşa, Antalya, Türkiye | Confirm physical address |
| Phone | +905541790203 | Confirm active number |
| WhatsApp | +905541790203 | Confirm active WhatsApp |
| Email | info@zenturotravel.com | Confirm inbox is monitored |

---

## 4. Domain / Hosting

| Item | Status | Action |
|------|--------|--------|
| DNS for zenturotravel.com | Unknown | Ensure A/CNAME points to hosting (Vercel or other) |
| SSL certificate | Auto via HSTS config | Verify HTTPS works after DNS propagation |
| Vercel project (if applicable) | Unknown | Set all env vars in Vercel dashboard |

---

## 5. Public Assets — Verification

| Asset | Path | Status |
|-------|------|--------|
| Logo SVG | `/logo.svg` | ✅ Exists |
| Favicon | `/favicon.svg` | ✅ Exists |
| Apple touch icon | `/apple-touch-icon.png` | ✅ Exists |
| Hero image | `/images/hero.jpg` | ✅ Exists |
| Vehicle images | `/vehicles/vip-6.jpg`, `vip-10.jpg`, `vip-16.jpg` | ✅ Exist |
| OG image | Dynamic via `opengraph-image.tsx` | ✅ Auto-generated, no static file needed |

---

## Summary

**Total external blockers: 3 categories**

1. **9 env vars** need real values from Supabase, Resend, Telegram, and GA4 dashboards
2. **5 legal pages** need business owner review and confirmation
3. **1 policy discrepancy** (24h vs 12h cancellation) needs business decision

Once these are resolved, the application is ready for production deployment.
