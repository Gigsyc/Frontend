import { WHEN_OPTIONS, eventMatchesWhen, type WhenValue } from "@/data/events";
import type { Event } from "@/types";

export type { WhenValue };

type Dated = Pick<Event, "date" | "endDate">;

/**
 * How many of these events sit in each window — cheap, since the caller already holds the list.
 *
 * The windows themselves are defined once in `@/data/events` (`eventMatchesWhen`) and the store
 * filters with the same function. For the counts to agree with the list underneath, the caller
 * must pass the list narrowed by every *other* active filter — category, place, price, query —
 * and only `when` left open. `/events` does that with a second `useEvents({ ...state, when: "all" })`.
 */
export function whenCounts(events: Dated[], now: Date = new Date()): Record<WhenValue, number> {
  const counts: Record<WhenValue, number> = { all: events.length, today: 0, tomorrow: 0, weekend: 0, week: 0, month: 0 };
  for (const event of events) {
    for (const option of WHEN_OPTIONS) {
      if (option.value !== "all" && eventMatchesWhen(event, option.value, now)) counts[option.value] += 1;
    }
  }
  return counts;
}
