-- ============================================================
-- Phase 1: Admin-manageable route pricing
-- Run against Supabase SQL Editor in order.
-- ============================================================

-- 1. Route prices table
CREATE TABLE IF NOT EXISTS route_prices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_key        TEXT NOT NULL,
  to_key          TEXT NOT NULL,
  vehicle_type    TEXT NOT NULL,
  base_price_eur  NUMERIC NOT NULL CHECK (base_price_eur > 0),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  updated_by      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_route_price UNIQUE (from_key, to_key, vehicle_type)
);

CREATE INDEX IF NOT EXISTS idx_route_prices_route ON route_prices(from_key, to_key);
CREATE INDEX IF NOT EXISTS idx_route_prices_type  ON route_prices(vehicle_type);

-- 2. Reservation quoted-price snapshot columns
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS quoted_base_price   NUMERIC;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS variant_surcharge   NUMERIC DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS quoted_total_price  NUMERIC;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS currency            TEXT DEFAULT 'EUR';

-- 3. Seed route prices from existing hardcoded pricing matrix.
--    Uses canonical place keys from config/places.ts.
--    Both directions stored explicitly.
INSERT INTO route_prices (from_key, to_key, vehicle_type, base_price_eur) VALUES
  -- AYT → destinations
  ('ayt', 'belek',    'vip-6',  70),
  ('ayt', 'belek',    'vip-10', 120),
  ('ayt', 'belek',    'vip-16', 160),
  ('ayt', 'kemer',    'vip-6',  80),
  ('ayt', 'kemer',    'vip-10', 130),
  ('ayt', 'kemer',    'vip-16', 170),
  ('ayt', 'lara',     'vip-6',  45),
  ('ayt', 'lara',     'vip-10', 80),
  ('ayt', 'lara',     'vip-16', 110),
  ('ayt', 'side',     'vip-6',  90),
  ('ayt', 'side',     'vip-10', 150),
  ('ayt', 'side',     'vip-16', 200),
  ('ayt', 'alanya',   'vip-6',  120),
  ('ayt', 'alanya',   'vip-10', 190),
  ('ayt', 'alanya',   'vip-16', 250),
  ('ayt', 'kundu',    'vip-6',  45),
  ('ayt', 'kundu',    'vip-10', 80),
  ('ayt', 'kundu',    'vip-16', 110),
  ('ayt', 'antalya',  'vip-6',  40),
  ('ayt', 'antalya',  'vip-10', 70),
  ('ayt', 'antalya',  'vip-16', 100),
  -- Reverse: destinations → AYT
  ('belek',   'ayt', 'vip-6',  70),
  ('belek',   'ayt', 'vip-10', 120),
  ('belek',   'ayt', 'vip-16', 160),
  ('kemer',   'ayt', 'vip-6',  80),
  ('kemer',   'ayt', 'vip-10', 130),
  ('kemer',   'ayt', 'vip-16', 170),
  ('lara',    'ayt', 'vip-6',  45),
  ('lara',    'ayt', 'vip-10', 80),
  ('lara',    'ayt', 'vip-16', 110),
  ('side',    'ayt', 'vip-6',  90),
  ('side',    'ayt', 'vip-10', 150),
  ('side',    'ayt', 'vip-16', 200),
  ('alanya',  'ayt', 'vip-6',  120),
  ('alanya',  'ayt', 'vip-10', 190),
  ('alanya',  'ayt', 'vip-16', 250)
ON CONFLICT (from_key, to_key, vehicle_type) DO NOTHING;
