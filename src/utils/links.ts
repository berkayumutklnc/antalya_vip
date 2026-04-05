export function waLink(phone?: string, text?: string) {
  const raw = (phone ?? "").toString().trim();
  if (!raw) return "#";
  const digits = raw.replace(/[^\d+]/g, "");
  const normalized = digits.startsWith("+") ? digits.slice(1) : digits;
  const q = encodeURIComponent(text ?? "");
  return `https://wa.me/${normalized}?text=${q}`;
}

type CalendarOptions = {
  title: string;
  startAt: number;
  endAt: number;
  details?: string;
  location?: string;
};

function toGCalDate(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function calendarUrl(opts: CalendarOptions): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title || "Event",
    dates: `${toGCalDate(opts.startAt)}/${toGCalDate(opts.endAt)}`,
    details: opts.details ?? "",
    location: opts.location ?? "",
    sf: "true",
    output: "xml",
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
