/**
 * Convert a Turkey-local date+time (UTC+3) to UTC milliseconds.
 * The user always enters Istanbul time; this subtracts 3 h to store as UTC.
 */
export function istToUtcMs(dateStr: string, timeStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const utc = Date.UTC(y, m - 1, d, hh - 3, mm, 0, 0);
  return utc;
}

export function addMinutes(ms: number, minutes: number): number {
  return ms + minutes * 60 * 1000;
}

export function fmtGCal(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}
