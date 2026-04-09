# Pre-launch External Blockers

> Items below **cannot be resolved in code** — they require business decisions,
> provider configuration, or legal review. The application is technically
> functional once these are completed.

---

## 1. Environment Variables (Provider Config)

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Server-side Firestore / Auth | Firebase Console → Project Settings → Service accounts → Generate new private key → base64-encode the JSON |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client Firebase SDK | Firebase Console → Project Settings → General → Web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client Firebase Auth | Same as above |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client Firestore | Same as above |
| `NEXT_PUBLIC_FIREBASE_STORAGE` | Client Storage bucket | Same as above |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client messaging | Same as above |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client app identifier | Same as above |
| `NEXT_PUBLIC_ADMIN_UID` | Admin dashboard access | Firebase Console → Authentication → Users → copy UID of admin user |
| `EMAILJS_SERVICE_ID` | Server-side email notifications | EmailJS dashboard → Email Services |
| `EMAILJS_PUBLIC_KEY` | EmailJS auth | EmailJS dashboard → Account → API Keys |
| `EMAILJS_PRIVATE_KEY` | EmailJS server auth | Same as above |
| `EMAILJS_TEMPLATE_ID` | Reservation confirmation email | EmailJS dashboard → Email Templates |
| `EMAILJS_ASSIGN_TEMPLATE_ID` | Vehicle assignment email | Same (create separate template or reuse) |
| `EMAILJS_CANCEL_TEMPLATE_ID` | Cancellation email | Same |
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

1. **15 env vars** need real values from Firebase, EmailJS, and GA4 dashboards
2. **5 legal pages** need business owner review and confirmation
3. **1 policy discrepancy** (24h vs 12h cancellation) needs business decision

Once these are resolved, the application is ready for production deployment.
