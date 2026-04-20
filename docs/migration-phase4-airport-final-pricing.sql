-- ============================================================
-- Phase 4: Final airport-origin pricing update (business-final)
-- Idempotent upsert for vip-10/vip-16 standard route base rows.
-- Maybach remains variant surcharge (+10 EUR), not route rows.
-- ============================================================

WITH vip10_base(from_key, to_key, base_price_eur) AS (
  VALUES
    ('ayt', 'tekirova', 65),
    ('ayt', 'beldibi', 50),
    ('ayt', 'kemer', 55),
    ('ayt', 'side', 50),
    ('ayt', 'belek', 45),
    ('ayt', 'gundogdu', 45),
    ('ayt', 'kizilagac', 60),
    ('ayt', 'okurcalar', 65),
    ('ayt', 'konakli', 75),
    ('ayt', 'alanya', 90)
),
symmetric_routes AS (
  SELECT from_key, to_key, base_price_eur FROM vip10_base
  UNION ALL
  SELECT to_key AS from_key, from_key AS to_key, base_price_eur FROM vip10_base
),
seed_prices AS (
  SELECT from_key, to_key, 'vip-10'::text AS vehicle_type, base_price_eur::numeric AS base_price_eur
  FROM symmetric_routes
  UNION ALL
  SELECT from_key, to_key, 'vip-16'::text AS vehicle_type, (base_price_eur + 5)::numeric AS base_price_eur
  FROM symmetric_routes
)
INSERT INTO route_prices (from_key, to_key, vehicle_type, base_price_eur, is_active)
SELECT from_key, to_key, vehicle_type, base_price_eur, true
FROM seed_prices
ON CONFLICT (from_key, to_key, vehicle_type)
DO UPDATE
SET
  base_price_eur = EXCLUDED.base_price_eur,
  is_active = true,
  updated_at = now();
