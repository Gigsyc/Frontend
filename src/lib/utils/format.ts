import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
} from "date-fns";

/** Rwandan Franc, whole units. "RWF 25,000" */
export function formatRwf(amount: number, opts: { compact?: boolean } = {}) {
  if (opts.compact && Math.abs(amount) >= 1_000_000) {
    return `RWF ${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (opts.compact && Math.abs(amount) >= 10_000) {
    return `RWF ${Math.round(amount / 1_000)}k`;
  }
  return `RWF ${Math.round(amount).toLocaleString("en-US")}`;
}

export function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

export function formatPercent(n: number, digits = 0) {
  return `${n.toFixed(digits)}%`;
}

const toDate = (d: string | Date) => (typeof d === "string" ? parseISO(d) : d);

/** "Mon 14 Sep" */
export function formatDayShort(d: string | Date) {
  return format(toDate(d), "EEE d MMM");
}

/** "Monday, 14 September 2026" */
export function formatDayLong(d: string | Date) {
  return format(toDate(d), "EEEE, d MMMM yyyy");
}

/** "14 Sep 2026" */
export function formatDate(d: string | Date) {
  return format(toDate(d), "d MMM yyyy");
}

/** Today / Tomorrow / Yesterday / "Wed 16 Sep" */
export function formatRelativeDay(d: string | Date) {
  const date = toDate(d);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isYesterday(date)) return "Yesterday";
  const diff = differenceInCalendarDays(date, new Date());
  if (diff > 1 && diff < 7) return format(date, "EEEE");
  return format(date, "EEE d MMM");
}

/** "07:00 – 15:30" */
export function formatTimeRange(start: string, end: string) {
  return `${start} – ${end}`;
}

/** "in 3 days", "2 hours ago" */
export function formatTimeAgo(d: string | Date) {
  return formatDistanceToNowStrict(toDate(d), { addSuffix: true });
}

/** Hours between two "HH:mm" strings, minus a break. */
export function shiftHours(start: string, end: string, breakMinutes = 0) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.max(0, (mins - breakMinutes) / 60);
}

export function initials(first: string, last?: string) {
  return `${first[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

export function pluralize(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
