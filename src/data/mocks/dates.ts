import { addDays, format, formatISO, subDays } from "date-fns";

/** All seed dates are relative to "now" so the demo never goes stale. */
export const NOW = new Date();

export const dayOffset = (n: number) => format(n >= 0 ? addDays(NOW, n) : subDays(NOW, -n), "yyyy-MM-dd");
export const isoOffset = (days: number, hour = 9, minute = 0) => {
  const d = n(days);
  d.setHours(hour, minute, 0, 0);
  return formatISO(d);
};
const n = (days: number) => (days >= 0 ? addDays(NOW, days) : subDays(NOW, -days));
