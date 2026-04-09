# Release Smoke Test Checklist

> Run through these checks after deploying to production or staging.
> Each test should be completable in under 2 minutes.

---

## 1. Landing Page

- [ ] Navigate to `/` — page loads without errors
- [ ] Header shows logo, navigation links work
- [ ] Footer renders with contact info, legal links
- [ ] WhatsApp FAB button visible in bottom-left corner
- [ ] Language switcher changes content (append `?lang=en`, `?lang=de`, `?lang=ru`, `?lang=tr`)

## 2. SEO / Meta

- [ ] View page source of `/` — `<html lang="de">` present
- [ ] Check `<title>` contains "Antalya VIP Transfer"
- [ ] Navigate to `/sitemap.xml` — valid XML with route entries
- [ ] Navigate to `/robots.txt` — valid robots file
- [ ] Check OG image: visit `/opengraph-image` — renders PNG with "Zenturo Travel" branding

## 3. Reservation Flow

- [ ] Navigate to `/rezervasyon`
- [ ] Step 1: Select from/to/date/time → click next
- [ ] Step 2: Enter passenger count → click next
- [ ] Step 3: Select vehicle type → price displays → click next
- [ ] Step 4: Enter name/phone/email → submit
- [ ] Confirmation screen shows PNR code (TRF-XXXXX)
- [ ] Check browser console — no JS errors

## 4. Reservation Lookup

- [ ] Navigate to `/rezervasyonumu-gor`
- [ ] Enter PNR code + email from step 3
- [ ] Reservation details display correctly
- [ ] If >12h before trip: cancel button is visible
- [ ] Submit cancel request → success message appears

## 5. Admin Panel

- [ ] Navigate to `/admin/login`
- [ ] Sign in with admin Firebase credentials
- [ ] `/admin` dashboard loads — shows reservation stats
- [ ] `/admin/reservations` — list of reservations visible
- [ ] Click a reservation → detail page loads
- [ ] Assign vehicle → status changes to "confirmed"
- [ ] `/admin/vehicles` — vehicle list loads

## 6. Notifications

- [ ] After creating a reservation, check EmailJS dashboard for sent email
- [ ] After assigning vehicle, check for assignment notification email
- [ ] In admin detail view: "Resend notification" button works
- [ ] Check server logs for `[notify]` entries

## 7. Consent & Analytics

- [ ] Fresh visit (clear localStorage): consent banner appears at bottom
- [ ] Click "Ablehnen" (deny) → banner disappears
- [ ] Check `localStorage.getItem('zenturo_consent')` → `"denied"`
- [ ] Clear localStorage, reload → click "Akzeptieren" (accept)
- [ ] Check `localStorage.getItem('zenturo_consent')` → `"granted"`
- [ ] Open GA4 Realtime report → pageview appears (only after accept)
- [ ] In console: `dataLayer` should show consent events

## 8. Error Handling

- [ ] Navigate to `/nonexistent-page` → 404 page renders with "Seite nicht gefunden"
- [ ] 404 page has "Zur Startseite" link back to `/`

## 9. Security Headers

- [ ] Check response headers (DevTools → Network → any request):
  - `X-Content-Type-Options: nosniff` ✓
  - `X-Frame-Options: DENY` ✓
  - `Referrer-Policy: strict-origin-when-cross-origin` ✓
  - `Strict-Transport-Security: max-age=63072000; ...` ✓
  - No `X-Powered-By` header ✓

## 10. Transfer Pages

- [ ] Navigate to `/belek-transfer` — content renders
- [ ] FAQ section visible
- [ ] "Why us" section visible
- [ ] Related transfer links work
- [ ] Breadcrumb JSON-LD in page source (structured data)

## 11. WhatsApp Integration

- [ ] Click WhatsApp FAB → opens wa.me link in new tab
- [ ] WhatsApp link includes correct phone number
- [ ] On transfer pages: WhatsApp reservation button visible and functional

## 12. Legal Pages

- [ ] `/datenschutz` — privacy policy page renders
- [ ] `/impressum` — legal notice renders with company info
- [ ] `/agb` — terms and conditions render
- [ ] `/policies/privacy` — alternate privacy policy renders
- [ ] `/policies/cancellation` — cancellation policy renders
