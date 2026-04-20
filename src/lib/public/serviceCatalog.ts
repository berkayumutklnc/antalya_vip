export type ServiceTypeLike = {
  id: string;
  isActive?: boolean;
  isBookable?: boolean;
  is_active?: boolean;
  is_bookable?: boolean;
};

/** vip-6 is legacy-only and must never appear as a normal public/commercial option. */
const LEGACY_ONLY_SERVICE_TYPES = new Set(["vip-6"]);

function isTrue(v: unknown): boolean {
  return v === true;
}

export function isPublicBookableServiceType(item: ServiceTypeLike): boolean {
  if (LEGACY_ONLY_SERVICE_TYPES.has(item.id)) return false;

  const active = item.isActive ?? item.is_active;
  const bookable = item.isBookable ?? item.is_bookable;

  // If flags are present, they must be true.
  if (active !== undefined && !isTrue(active)) return false;
  if (bookable !== undefined && !isTrue(bookable)) return false;

  return true;
}

export function getPublicBookableServiceTypes<T extends ServiceTypeLike>(items: T[]): T[] {
  return items.filter(isPublicBookableServiceType);
}
