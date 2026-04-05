import { BlockedSlot } from "@/types";

export function isVehicleFree(
  blocked: BlockedSlot[] | undefined,
  startAt: number,
  endAt: number
): boolean {
  if (!blocked || blocked.length === 0) return true;
  return blocked.every((b) => endAt <= b.startAt || startAt >= b.endAt);
}

export function canCancel(startAt: number): boolean {
  const twelveH = 12 * 60 * 60 * 1000;
  return startAt - Date.now() > twelveH;
}
