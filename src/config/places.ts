/**
 * Canonical place list shared by the reservation form and pricing matrix.
 * The `label` is the display string stored in Firestore `from`/`to` fields.
 * The `id` is the canonical internal key stored in `fromKey`/`toKey` fields.
 * Always use these labels (or the PLACE_LABELS array) when building forms
 * or looking up prices — never hardcode a separate list.
 */
export const PLACES = [
  { id: "ayt",       label: "Antalya Airport (AYT)" },
  { id: "antalya",   label: "Antalya City Center" },
  { id: "lara",      label: "Lara" },
  { id: "kundu",     label: "Kundu" },
  { id: "belek",     label: "Belek" },
  { id: "gundogdu",  label: "Gündoğdu" },
  { id: "side",      label: "Side" },
  { id: "kizilagac", label: "Kızılağaç" },
  { id: "manavgat",  label: "Manavgat" },
  { id: "okurcalar", label: "Okurcalar" },
  { id: "konakli",   label: "Konaklı" },
  { id: "alanya",    label: "Alanya" },
  { id: "kemer",     label: "Kemer" },
  { id: "tekirova",  label: "Tekirova" },
  { id: "kas",       label: "Kaş" },
  { id: "kalkan",    label: "Kalkan" },
  { id: "goynuk",    label: "Göynük" },
  { id: "beldibi",   label: "Beldibi" },
  { id: "cirali",    label: "Çıralı" },
  { id: "olimpos",   label: "Olimpos" },
] as const;

/** Flat array of display labels — use in form datalists and autocomplete */
export const PLACE_LABELS = PLACES.map((p) => p.label);
