/**
 * Place normalization layer.
 *
 * Provides bidirectional lookup between canonical `id` keys and display
 * `label` values.  All business logic should pass through these helpers
 * so that label changes never silently break pricing or routing.
 *
 * Existing Firestore documents store labels in `from`/`to`.  Phase 3 adds
 * `fromKey`/`toKey` alongside them for future reliability — old docs
 * without keys remain readable via label-based fallback.
 */

import { PLACES } from "@/config/places";

export type PlaceId = (typeof PLACES)[number]["id"];
export type PlaceLabel = (typeof PLACES)[number]["label"];

// Pre-computed lookup maps (computed once at module load)
const byId = new Map<string, (typeof PLACES)[number]>();
const byLabel = new Map<string, (typeof PLACES)[number]>();

for (const p of PLACES) {
  byId.set(p.id, p);
  byLabel.set(p.label, p);
}

/** Resolve a place object by its canonical `id` key. */
export function placeById(id: string): (typeof PLACES)[number] | undefined {
  return byId.get(id);
}

/** Resolve a place object by its display `label`. */
export function placeByLabel(label: string): (typeof PLACES)[number] | undefined {
  return byLabel.get(label);
}

/**
 * Given a label (the value stored in Firestore `from`/`to`), return
 * the canonical key, or `undefined` if the label is unknown.
 */
export function labelToKey(label: string): PlaceId | undefined {
  return byLabel.get(label)?.id as PlaceId | undefined;
}

/**
 * Given a canonical key, return the display label.
 */
export function keyToLabel(key: string): PlaceLabel | undefined {
  return byId.get(key)?.label as PlaceLabel | undefined;
}

/**
 * Resolve a place key from either a key or a label.
 * Useful for ingesting user input that could be either format.
 */
export function resolveKey(input: string): PlaceId | undefined {
  if (byId.has(input)) return input as PlaceId;
  return labelToKey(input);
}

/**
 * Build the normalized place fields to store alongside the existing
 * label-based `from`/`to` fields in a reservation document.
 *
 * Returns `{ fromKey, toKey }` or `undefined` values if labels are unknown.
 */
export function normalizePlaceFields(fromLabel: string, toLabel: string) {
  return {
    fromKey: labelToKey(fromLabel) ?? null,
    toKey: labelToKey(toLabel) ?? null,
    fromLabel: fromLabel,
    toLabel: toLabel,
  };
}
