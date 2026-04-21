-- ============================================================
-- ZENTURO TRAVEL — TAM KURULUM MIGRATION
-- Supabase SQL Editor'da TEK SEFERDE calistirin.
-- Guvenli: idempotent (defalarca calistirabilirsiniz).
-- ============================================================

-- ── 1. reservations tablosu ─────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                TEXT UNIQUE NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending',
  full_name           TEXT,
  email               TEXT,
  phone               TEXT,
  "from"              TEXT,
  "to"                TEXT,
  from_key            TEXT,
  to_key              TEXT,
  date                TEXT,
  time                TEXT,
  start_at            BIGINT,
  adults              INT DEFAULT 1,
  baby_seat           INT DEFAULT 0,
  vehicle_type        TEXT,
  service_type_id     TEXT,
  service_variant_key TEXT,
  price               NUMERIC,
  quoted_base_price   NUMERIC,
  variant_surcharge   NUMERIC DEFAULT 0,
  quoted_total_price  NUMERIC,
  currency            TEXT DEFAULT 'EUR',
  lang                TEXT DEFAULT 'de',
  vehicle_id          UUID,
  plate               TEXT,
  driver_name         TEXT,
  driver_phone        TEXT,
  cancel_requested    BOOLEAN DEFAULT false,
  cancel_reason       TEXT,
  cancel_requested_at TIMESTAMPTZ,
  cancel_canceled_at  TIMESTAMPTZ,
  flight_no           TEXT,
  terminal            TEXT,
  baggage_count       INT,
  note                TEXT,
  accept_policy       BOOLEAN,
  accept_kvkk         BOOLEAN,
  accept_comms        BOOLEAN,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabloya sonradan eklenen kolonlari guvende ekle
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS from_key            TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS to_key              TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS start_at            BIGINT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS service_type_id     TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS service_variant_key TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS quoted_base_price   NUMERIC;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS variant_surcharge   NUMERIC DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS quoted_total_price  NUMERIC;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS currency            TEXT DEFAULT 'EUR';
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS lang                TEXT DEFAULT 'de';
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS vehicle_id          UUID;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS plate               TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS driver_name         TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS driver_phone        TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cancel_requested    BOOLEAN DEFAULT false;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cancel_reason       TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cancel_requested_at TIMESTAMPTZ;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cancel_canceled_at  TIMESTAMPTZ;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS flight_no           TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS terminal            TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS baggage_count       INT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS note                TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS accept_policy       BOOLEAN;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS accept_kvkk         BOOLEAN;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS accept_comms        BOOLEAN;

-- ── 2. vehicles tablosu ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL,
  plate        TEXT,
  driver_name  TEXT,
  driver_phone TEXT,
  capacity     INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. blocked_slots tablosu ────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_slots (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id     UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  start_at       BIGINT,
  end_at         BIGINT,
  reason         TEXT DEFAULT 'manual',
  reservation_id TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 4. reservation_events tablosu ───────────────────────────
CREATE TABLE IF NOT EXISTS reservation_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id   TEXT NOT NULL,
  reservation_code TEXT,
  type             TEXT NOT NULL,
  actor_type       TEXT,
  actor_id         TEXT,
  meta             JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5. notification_logs tablosu ────────────────────────────
CREATE TABLE IF NOT EXISTS notification_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id    TEXT NOT NULL,
  reservation_code  TEXT,
  channel           TEXT NOT NULL,
  notification_type TEXT,
  recipient         TEXT,
  status            TEXT NOT NULL,
  error_message     TEXT,
  provider_meta     JSONB,
  triggered_by      TEXT,
  triggered_by_id   TEXT,
  dedupe_key        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 6. route_prices tablosu ─────────────────────────────────
CREATE TABLE IF NOT EXISTS route_prices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_key       TEXT NOT NULL,
  to_key         TEXT NOT NULL,
  vehicle_type   TEXT NOT NULL,
  base_price_eur NUMERIC NOT NULL CHECK (base_price_eur > 0),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  updated_by     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_route_price UNIQUE (from_key, to_key, vehicle_type)
);

-- ── 7. service_types tablosu ────────────────────────────────
CREATE TABLE IF NOT EXISTS service_types (
  id          TEXT PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name_de     TEXT NOT NULL DEFAULT '',
  name_en     TEXT NOT NULL DEFAULT '',
  name_tr     TEXT NOT NULL DEFAULT '',
  name_ru     TEXT NOT NULL DEFAULT '',
  capacity    INT NOT NULL DEFAULT 0,
  image       TEXT DEFAULT '',
  features    JSONB DEFAULT '[]',
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  is_bookable BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 8. service_variants tablosu ─────────────────────────────
CREATE TABLE IF NOT EXISTS service_variants (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type_id    TEXT NOT NULL REFERENCES service_types(id),
  key                TEXT NOT NULL,
  name_de            TEXT NOT NULL DEFAULT '',
  name_en            TEXT NOT NULL DEFAULT '',
  name_tr            TEXT NOT NULL DEFAULT '',
  name_ru            TEXT NOT NULL DEFAULT '',
  price_modifier_eur NUMERIC NOT NULL DEFAULT 0,
  sort_order         INT NOT NULL DEFAULT 0,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_variant UNIQUE (service_type_id, key)
);

-- ── 9. Indexler ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reservations_code        ON reservations(code);
CREATE INDEX IF NOT EXISTS idx_reservations_status      ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_vehicle    ON blocked_slots(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reservation_events_rid   ON reservation_events(reservation_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_rid    ON notification_logs(reservation_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_dedupe ON notification_logs(dedupe_key, status, created_at);
CREATE INDEX IF NOT EXISTS idx_route_prices_route       ON route_prices(from_key, to_key);
CREATE INDEX IF NOT EXISTS idx_route_prices_type        ON route_prices(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_service_variants_type    ON service_variants(service_type_id);

-- ── 10. service_types seed verisi ───────────────────────────
INSERT INTO service_types (id, slug, name_de, name_en, name_tr, name_ru, capacity, image, features, sort_order, is_active, is_bookable) VALUES
  ('vip-6',  'vip-minivan-6',  'VIP Minivan (6 Sitze)',  'VIP Minivan (6 Seats)',  'VIP Minivan (6 Koltuk)',  'VIP Минивэн (6 мест)',  6,  '/vehicles/vip-6.jpg',  '["wifi","usb","ac","water","luggage"]', 0, true, false),
  ('vip-10', 'vip-minibus-10', 'VIP Minibus (10 Sitze)', 'VIP Minibus (10 Seats)', 'VIP Minibüs (10 Koltuk)', 'VIP Минибус (10 мест)', 10, '/vehicles/vip-10.jpg', '["wifi","usb","ac","water","luggage"]', 1, true, true),
  ('vip-16', 'vip-minibus-16', 'VIP Minibus (16 Sitze)', 'VIP Minibus (16 Seats)', 'VIP Minibüs (16 Koltuk)', 'VIP Минибус (16 мест)', 16, '/vehicles/vip-16.jpg', '["wifi","usb","ac","water","luggage"]', 2, true, true)
ON CONFLICT (id) DO NOTHING;

-- ── 11. service_variants seed verisi ────────────────────────
INSERT INTO service_variants (service_type_id, key, name_de, name_en, name_tr, name_ru, price_modifier_eur, sort_order) VALUES
  ('vip-10', 'standard', 'Standard', 'Standard', 'Standart', 'Стандарт',  0, 0),
  ('vip-10', 'maybach',  'Maybach',  'Maybach',  'Maybach',  'Maybach',  10, 1),
  ('vip-16', 'standard', 'Standard', 'Standard', 'Standart', 'Стандарт',  0, 0),
  ('vip-16', 'maybach',  'Maybach',  'Maybach',  'Maybach',  'Maybach',  10, 1)
ON CONFLICT (service_type_id, key) DO NOTHING;

-- ── 12. route_prices — tum rotalar (her iki yon) ────────────
INSERT INTO route_prices (from_key, to_key, vehicle_type, base_price_eur) VALUES
  -- AYT → yerler (vip-10)
  ('ayt', 'lara',     'vip-10', 80),
  ('ayt', 'kundu',    'vip-10', 80),
  ('ayt', 'antalya',  'vip-10', 70),
  ('ayt', 'belek',    'vip-10', 45),
  ('ayt', 'gundogdu', 'vip-10', 45),
  ('ayt', 'side',     'vip-10', 50),
  ('ayt', 'kizilagac','vip-10', 60),
  ('ayt', 'manavgat', 'vip-10', 55),
  ('ayt', 'okurcalar','vip-10', 65),
  ('ayt', 'konakli',  'vip-10', 75),
  ('ayt', 'alanya',   'vip-10', 90),
  ('ayt', 'kemer',    'vip-10', 55),
  ('ayt', 'tekirova', 'vip-10', 65),
  ('ayt', 'beldibi',  'vip-10', 50),
  ('ayt', 'goynuk',   'vip-10', 55),
  ('ayt', 'cirali',   'vip-10', 80),
  ('ayt', 'olimpos',  'vip-10', 75),
  ('ayt', 'kas',      'vip-10', 140),
  ('ayt', 'kalkan',   'vip-10', 130),
  -- AYT → yerler (vip-16 = vip-10 + 5)
  ('ayt', 'lara',     'vip-16', 85),
  ('ayt', 'kundu',    'vip-16', 85),
  ('ayt', 'antalya',  'vip-16', 75),
  ('ayt', 'belek',    'vip-16', 50),
  ('ayt', 'gundogdu', 'vip-16', 50),
  ('ayt', 'side',     'vip-16', 55),
  ('ayt', 'kizilagac','vip-16', 65),
  ('ayt', 'manavgat', 'vip-16', 60),
  ('ayt', 'okurcalar','vip-16', 70),
  ('ayt', 'konakli',  'vip-16', 80),
  ('ayt', 'alanya',   'vip-16', 95),
  ('ayt', 'kemer',    'vip-16', 60),
  ('ayt', 'tekirova', 'vip-16', 70),
  ('ayt', 'beldibi',  'vip-16', 55),
  ('ayt', 'goynuk',   'vip-16', 60),
  ('ayt', 'cirali',   'vip-16', 85),
  ('ayt', 'olimpos',  'vip-16', 80),
  ('ayt', 'kas',      'vip-16', 145),
  ('ayt', 'kalkan',   'vip-16', 135),
  -- Ters yon: yerler → AYT (vip-10)
  ('lara',     'ayt', 'vip-10', 80),
  ('kundu',    'ayt', 'vip-10', 80),
  ('antalya',  'ayt', 'vip-10', 70),
  ('belek',    'ayt', 'vip-10', 45),
  ('gundogdu', 'ayt', 'vip-10', 45),
  ('side',     'ayt', 'vip-10', 50),
  ('kizilagac','ayt', 'vip-10', 60),
  ('manavgat', 'ayt', 'vip-10', 55),
  ('okurcalar','ayt', 'vip-10', 65),
  ('konakli',  'ayt', 'vip-10', 75),
  ('alanya',   'ayt', 'vip-10', 90),
  ('kemer',    'ayt', 'vip-10', 55),
  ('tekirova', 'ayt', 'vip-10', 65),
  ('beldibi',  'ayt', 'vip-10', 50),
  ('goynuk',   'ayt', 'vip-10', 55),
  ('cirali',   'ayt', 'vip-10', 80),
  ('olimpos',  'ayt', 'vip-10', 75),
  ('kas',      'ayt', 'vip-10', 140),
  ('kalkan',   'ayt', 'vip-10', 130),
  -- Ters yon: yerler → AYT (vip-16)
  ('lara',     'ayt', 'vip-16', 85),
  ('kundu',    'ayt', 'vip-16', 85),
  ('antalya',  'ayt', 'vip-16', 75),
  ('belek',    'ayt', 'vip-16', 50),
  ('gundogdu', 'ayt', 'vip-16', 50),
  ('side',     'ayt', 'vip-16', 55),
  ('kizilagac','ayt', 'vip-16', 65),
  ('manavgat', 'ayt', 'vip-16', 60),
  ('okurcalar','ayt', 'vip-16', 70),
  ('konakli',  'ayt', 'vip-16', 80),
  ('alanya',   'ayt', 'vip-16', 95),
  ('kemer',    'ayt', 'vip-16', 60),
  ('tekirova', 'ayt', 'vip-16', 70),
  ('beldibi',  'ayt', 'vip-16', 55),
  ('goynuk',   'ayt', 'vip-16', 60),
  ('cirali',   'ayt', 'vip-16', 85),
  ('olimpos',  'ayt', 'vip-16', 80),
  ('kas',      'ayt', 'vip-16', 145),
  ('kalkan',   'ayt', 'vip-16', 135)
ON CONFLICT (from_key, to_key, vehicle_type) DO UPDATE
  SET base_price_eur = EXCLUDED.base_price_eur,
      is_active = true,
      updated_at = now();
