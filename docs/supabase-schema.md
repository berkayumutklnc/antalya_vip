# Supabase Schema Reference

> Last updated: Phase 6 — added telegram channel, verified all Phase 2–5 columns

## Tables

### `reservations`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `code` | TEXT UNIQUE NOT NULL | PNR code (e.g. `ZT-A1B2C3`). Used as the primary lookup key in admin routes. |
| `status` | TEXT | `pending`, `confirmed`, `completed`, `no_show`, `canceled` |
| `full_name` | TEXT | |
| `email` | TEXT | Lowercased at creation |
| `phone` | TEXT | |
| `from` | TEXT | Human-readable pickup label |
| `to` | TEXT | Human-readable dropoff label |
| `from_key` | TEXT | Normalized place key for pricing |
| `to_key` | TEXT | Normalized place key for pricing |
| `date` | TEXT | `YYYY-MM-DD` |
| `time` | TEXT | `HH:MM` |
| `start_at` | BIGINT | UTC ms timestamp computed from date+time |
| `adults` | INT | Default 1 |
| `baby_seat` | INT | Default 0 |
| `vehicle_type` | TEXT | `vip-6`, `vip-10`, `vip-16` |
| `service_type_id` | TEXT | FK → service_types.id. Matches vehicle_type during transition. |
| `service_variant_key` | TEXT | e.g. `standard`, `maybach` |
| `price` | NUMERIC | Nullable. Backward-compat alias for `quoted_total_price`. |
| `quoted_base_price` | NUMERIC | Route base price snapshot at booking time |
| `variant_surcharge` | NUMERIC | Variant surcharge snapshot (default 0, Phase 2) |
| `quoted_total_price` | NUMERIC | Final quoted price = base + surcharge |
| `currency` | TEXT | Default `EUR` |
| `lang` | TEXT | Default `de` |
| `vehicle_id` | UUID FK → vehicles | Set on assignment |
| `plate` | TEXT | Denormalized from vehicle on assignment |
| `driver_name` | TEXT | Denormalized from vehicle on assignment |
| `driver_phone` | TEXT | Denormalized from vehicle on assignment |
| `cancel_requested` | BOOLEAN | |
| `cancel_reason` | TEXT | |
| `cancel_requested_at` | TIMESTAMPTZ | |
| `cancel_canceled_at` | TIMESTAMPTZ | |
| `flight_no` | TEXT | |
| `terminal` | TEXT | |
| `baggage_count` | INT | |
| `note` | TEXT | |
| `accept_policy` | BOOLEAN | |
| `accept_kvkk` | BOOLEAN | |
| `accept_comms` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `updated_at` | TIMESTAMPTZ | Default `now()` |

### `vehicles`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `type` | TEXT | `vip-6`, `vip-10`, `vip-16` |
| `plate` | TEXT | |
| `driver_name` | TEXT | |
| `driver_phone` | TEXT | |
| `capacity` | INT | |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `updated_at` | TIMESTAMPTZ | Default `now()` |

### `route_prices`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `from_key` | TEXT NOT NULL | Canonical place key (e.g. `ayt`, `belek`) |
| `to_key` | TEXT NOT NULL | Canonical place key |
| `vehicle_type` | TEXT NOT NULL | `vip-6`, `vip-10`, `vip-16` |
| `base_price_eur` | NUMERIC NOT NULL | Base price in EUR (must be > 0) |
| `is_active` | BOOLEAN | Default `true`. Soft-delete sets to `false`. |
| `updated_by` | TEXT | Admin UID who last modified |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `updated_at` | TIMESTAMPTZ | Default `now()` |

**Constraints:** `UNIQUE(from_key, to_key, vehicle_type)`, `CHECK(base_price_eur > 0)`

### `service_types`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | e.g. `vip-10`, `vip-16` |
| `slug` | TEXT UNIQUE NOT NULL | URL-friendly slug |
| `name_de` | TEXT | German name |
| `name_en` | TEXT | English name |
| `name_tr` | TEXT | Turkish name |
| `name_ru` | TEXT | Russian name |
| `capacity` | INT | Seat count |
| `image` | TEXT | Path to vehicle image |
| `features` | JSONB | Array of feature keys e.g. `["wifi","usb","ac"]` |
| `sort_order` | INT | Display order |
| `is_active` | BOOLEAN | Default `true` |
| `is_bookable` | BOOLEAN | Default `true`. `false` = visible but not selectable for new bookings |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `updated_at` | TIMESTAMPTZ | Default `now()` |

### `service_variants`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `service_type_id` | TEXT FK → service_types | Parent service type |
| `key` | TEXT NOT NULL | e.g. `standard`, `maybach` |
| `name_de` | TEXT | German name |
| `name_en` | TEXT | English name |
| `name_tr` | TEXT | Turkish name |
| `name_ru` | TEXT | Russian name |
| `price_modifier_eur` | NUMERIC | Surcharge in EUR (default 0) |
| `sort_order` | INT | Display order |
| `is_active` | BOOLEAN | Default `true` |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `updated_at` | TIMESTAMPTZ | Default `now()` |

**Constraints:** `UNIQUE(service_type_id, key)`

### `blocked_slots`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `vehicle_id` | UUID FK → vehicles | `ON DELETE CASCADE` |
| `start_at` | BIGINT | UTC ms |
| `end_at` | BIGINT | UTC ms |
| `reason` | TEXT | Default `manual` |
| `reservation_id` | TEXT | Reservation **code** (not UUID). See linkage note below. |
| `created_at` | TIMESTAMPTZ | Default `now()` |

### `reservation_events`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `reservation_id` | TEXT | Reservation **code** (not UUID FK). |
| `reservation_code` | TEXT | Redundant — same as reservation_id in current usage |
| `type` | TEXT | Event type (e.g. `status_changed`, `created`) |
| `actor_type` | TEXT | `admin`, `public`, `system` |
| `actor_id` | TEXT | UID of acting user |
| `meta` | JSONB | Arbitrary event metadata |
| `created_at` | TIMESTAMPTZ | Default `now()` |

### `notification_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `reservation_id` | TEXT | Reservation **code** (not UUID FK). |
| `reservation_code` | TEXT | Redundant — same as reservation_id |
| `channel` | TEXT | `email`, `telegram`, `whatsapp_link`, `system` |
| `notification_type` | TEXT | e.g. `reservation_created_customer` |
| `recipient` | TEXT | Email or phone |
| `status` | TEXT | `sent`, `failed`, `skipped`, `generated` |
| `error_message` | TEXT | |
| `provider_meta` | JSONB | |
| `triggered_by` | TEXT | `public`, `admin`, `system` |
| `triggered_by_id` | TEXT | |
| `dedupe_key` | TEXT | |
| `created_at` | TIMESTAMPTZ | Default `now()` |

## Linkage Design

Reservation-related tables (`reservation_events`, `notification_logs`, `blocked_slots`) reference
reservations by **code** (the PNR string), not by UUID. This is an **intentional compatibility
choice** carried over from the Firebase migration:

- The admin UI and all API routes use `code` as the primary reservation identifier.
- Events and logs write `reservation_id = code` (a TEXT field, not a UUID FK).
- `blocked_slots.reservation_id` stores the reservation code to enable cleanup by code.

This means there are no enforced foreign keys from these tables back to `reservations.id`.
A future pass could migrate to UUID-based FKs, but the current code-centric approach keeps
the migration safe and the admin UX consistent.

## Auth

- Admin role is stored in **`app_metadata.role`** (not `user_metadata`).
- `app_metadata` cannot be modified by the user — only via service_role API.
- Set via: `node scripts/set-admin.mjs <USER_ID> true`

## Indexes

```sql
CREATE INDEX idx_reservations_code ON reservations(code);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_blocked_slots_vehicle ON blocked_slots(vehicle_id);
CREATE INDEX idx_reservation_events_rid ON reservation_events(reservation_id);
CREATE INDEX idx_notification_logs_rid ON notification_logs(reservation_id);
CREATE INDEX idx_notification_logs_dedupe ON notification_logs(dedupe_key, status, created_at);
CREATE INDEX idx_route_prices_route ON route_prices(from_key, to_key);
CREATE INDEX idx_route_prices_type ON route_prices(vehicle_type);
```
