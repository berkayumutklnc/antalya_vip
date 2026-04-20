-- ============================================================
-- Phase 2: Service Types + Variants
-- Run against Supabase SQL Editor AFTER Phase 1 migration.
-- ============================================================

-- 1. Service types table
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

-- 2. Service variants table
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

CREATE INDEX IF NOT EXISTS idx_service_variants_type ON service_variants(service_type_id);

-- 3. New reservation columns for service catalog
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS service_type_id     TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS service_variant_key TEXT;

-- 4. Seed service types
INSERT INTO service_types (id, slug, name_de, name_en, name_tr, name_ru, capacity, image, features, sort_order, is_active, is_bookable) VALUES
  ('vip-6',  'vip-minivan-6',  'VIP Minivan (6 Sitze)',  'VIP Minivan (6 Seats)',  'VIP Minivan (6 Koltuk)',  'VIP Минивэн (6 мест)',  6,  '/vehicles/vip-6.jpg',  '["wifi","usb","ac","water","luggage"]', 0, true, false),
  ('vip-10', 'vip-minibus-10', 'VIP Minibus (10 Sitze)', 'VIP Minibus (10 Seats)', 'VIP Minibüs (10 Koltuk)', 'VIP Минибус (10 мест)', 10, '/vehicles/vip-10.jpg', '["wifi","usb","ac","water","luggage"]', 1, true, true),
  ('vip-16', 'vip-minibus-16', 'VIP Minibus (16 Sitze)', 'VIP Minibus (16 Seats)', 'VIP Minibüs (16 Koltuk)', 'VIP Минибус (16 мест)', 16, '/vehicles/vip-16.jpg', '["wifi","usb","ac","water","luggage"]', 2, true, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed service variants (standard + maybach for each bookable type)
INSERT INTO service_variants (service_type_id, key, name_de, name_en, name_tr, name_ru, price_modifier_eur, sort_order) VALUES
  ('vip-10', 'standard', 'Standard',     'Standard',     'Standart',     'Стандарт',  0,  0),
  ('vip-10', 'maybach',  'Maybach',      'Maybach',      'Maybach',      'Maybach',   10, 1),
  ('vip-16', 'standard', 'Standard',     'Standard',     'Standart',     'Стандарт',  0,  0),
  ('vip-16', 'maybach',  'Maybach',      'Maybach',      'Maybach',      'Maybach',   10, 1)
ON CONFLICT (service_type_id, key) DO NOTHING;
