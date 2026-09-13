import { format, isBefore, parseISO } from "date-fns";
import type { Transition } from "motion/react";
import { formatDayLong, shiftHours } from "@/lib/utils";
import type { AttendanceMode, Event, TicketTier } from "@/types";

/** Festivals and conferences run over several days; single-day events must not say "18 – 18 Sep". */
export function isMultiDay(event: Pick<Event, "date" | "endDate">): boolean {
  return !!event.endDate && event.endDate !== event.date;
}

/** "5h" / "4.5h" — a trailing ".0" reads like a spreadsheet, so it is dropped. */
export function formatHours(hours: number): string {
  return `${Number(hours.toFixed(1))}h`;
}

export function eventHours(event: Pick<Event, "startTime" | "endTime">): number {
  return shiftHours(event.startTime, event.endTime);
}

/** "Saturday, 19 September 2026", or both ends for a run of days. */
export function fullDateLabel(event: Pick<Event, "date" | "endDate">): string {
  if (!isMultiDay(event) || !event.endDate) return formatDayLong(event.date);
  return `${format(parseISO(event.date), "EEEE, d MMMM")} – ${formatDayLong(event.endDate)}`;
}

/** Google Maps hand-off. No embedded map in the prototype — an honest address beats a fake pin. */
export function mapsUrl(event: Pick<Event, "address" | "place">): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.address}, ${event.place}`)}`;
}

/** House list stagger: 30ms apart, capped at eight items so long lists never crawl. */
export function stagger(index: number): Transition {
  return { duration: 0.3, delay: Math.min(index, 7) * 0.03, ease: [0.22, 1, 0.36, 1] };
}

/**
 * True once the event's last day has ended. Public event *lists* already drop finished
 * events, but a detail page stays reachable by link, so the page has to decide for itself
 * whether a `published` event is still on. Same rule the public queries use: the run ends
 * at `endTime` on the final day, and a past-midnight end time counts as the end of that day.
 */
export function isEventOver(event: Pick<Event, "date" | "endDate" | "startTime" | "endTime">): boolean {
  const last = event.endDate ?? event.date;
  const end = event.endTime < event.startTime ? "23:59" : event.endTime;
  return isBefore(parseISO(`${last}T${end}`), new Date());
}

/** Still on: published, and not already run. Everything else is cancelled or finished. */
export function isEventLive(event: Event): boolean {
  return event.status === "published" && !isEventOver(event);
}

/** The one place the detail page words its primary action. */
export const PRIMARY_ACTION_LABEL: Record<AttendanceMode, string> = {
  tickets: "Get tickets",
  register: "Register",
  free: "I'm going",
};

/** Cheapest available tier — the one the action card quotes and the dialog preselects. */
export function cheapestTier(tickets: TicketTier[]): TicketTier | undefined {
  return tickets.filter((t) => !t.soldOut).sort((a, b) => a.price - b.price)[0] ?? tickets[0];
}

export function spotsLeft(event: Pick<Event, "capacity" | "attending">): number {
  return Math.max(0, event.capacity - event.attending);
}

export function fillPercent(event: Pick<Event, "capacity" | "attending">): number {
  return event.capacity > 0 ? Math.min(100, (event.attending / event.capacity) * 100) : 0;
}
