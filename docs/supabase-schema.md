# Supabase Schema Reference

> Last updated: 2026-04-12 — migration hardening pass

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
| `price` | NUMERIC | Nullable |
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
| `channel` | TEXT | `email`, `whatsapp_link`, `system` |
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
```
