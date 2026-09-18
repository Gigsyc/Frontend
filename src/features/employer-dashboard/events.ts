import { format, isAfter, isSameMonth, parseISO } from "date-fns";
import type { Event } from "@/types";

/** The moment an event is over — multi-day events use their last day. */
export const eventEndsAt = (e: Pick<Event, "date" | "endDate" | "endTime">) => parseISO(`${e.endDate ?? e.date}T${e.endTime}`);

/** Still ahead of us: today's events count until their end time passes. */
export const eventIsAhead = (e: Event, now: Date) => isAfter(eventEndsAt(e), now);

const byDate = (a: Event, b: Event) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`);

/**
 * The hero: the soonest event that is either live or waiting on GigSyc. Drafts stay out —
 * an unfinished listing is not something to build the morning around.
 */
export function pickUpNext(events: Event[], now: Date): Event | undefined {
  return events
    .filter((e) => (e.status === "published" || e.status === "pending_review") && eventIsAhead(e, now))
    .sort(byDate)[0];
}

/** "Your events": everything still ahead that hasn't been cancelled, soonest first. */
export function nextEvents(events: Event[], now: Date, limit = 4): Event[] {
  return events
    .filter((e) => e.status !== "cancelled" && eventIsAhead(e, now))
    .sort(byDate)
    .slice(0, limit);
}

export interface GuestsThisMonth {
  guests: number;
  events: number;
  monthName: string;
}

/** Guests across this month's live and finished events — the promoter's headline number. */
export function guestsThisMonth(events: Event[], now: Date): GuestsThisMonth {
  const inMonth = events.filter(
    (e) => (e.status === "published" || e.status === "completed") && isSameMonth(parseISO(e.date), now),
  );
  return {
    guests: inMonth.reduce((sum, e) => sum + e.attending, 0),
    events: inMonth.length,
    monthName: format(now, "MMMM"),
  };
}

/** Published and still ahead — what a guest can find on GigSyc right now. */
export function liveEventCount(events: Event[], now: Date): number {
  return events.filter((e) => e.status === "published" && eventIsAhead(e, now)).length;
}

/** The first sentence of a review note, so the attention card stays one line. */
export function firstLineOf(note: string | undefined): string | undefined {
  const trimmed = note?.trim();
  if (!trimmed) return undefined;
  const [first] = trimmed.split(/(?<=[.!?])\s+|\n/);
  return first;
}
