import { addDays, endOfDay, parseISO, startOfDay } from "date-fns";
import type { EventCategory, EventStatus, RwandaPlace } from "@/types";
import { IMAGES } from "./images";

export interface CategoryMeta {
  id: EventCategory;
  label: string;
  /** Short line used on category chips and the category rail. */
  blurb: string;
  /** lucide icon name, resolved in the UI layer. */
  icon: string;
  image: string;
}

export const EVENT_CATEGORIES: Record<EventCategory, CategoryMeta> = {
  music: { id: "music", label: "Music", blurb: "Concerts, live sets and listening nights", icon: "Music", image: IMAGES.concertStage },
  culture: { id: "culture", label: "Culture", blurb: "Heritage, dance, film and art", icon: "Drama", image: IMAGES.cultureCrowd },
  food: { id: "food", label: "Food & drink", blurb: "Tastings, markets and supper clubs", icon: "UtensilsCrossed", image: IMAGES.foodPlates },
  sports: { id: "sports", label: "Sports", blurb: "Races, matches and tournaments", icon: "Trophy", image: IMAGES.cycling },
  nightlife: { id: "nightlife", label: "Nightlife", blurb: "Late sets, rooftops and lounges", icon: "Martini", image: IMAGES.cocktailsNeon },
  family: { id: "family", label: "Family", blurb: "Days out that work for every age", icon: "Baby", image: IMAGES.familyKids },
  business: { id: "business", label: "Business", blurb: "Summits, expos and networking", icon: "Briefcase", image: IMAGES.conferenceHall },
  festivals: { id: "festivals", label: "Festivals", blurb: "Multi-day celebrations", icon: "PartyPopper", image: IMAGES.festivalCrowd },
  outdoor: { id: "outdoor", label: "Outdoor", blurb: "Trails, parks and the open road", icon: "Mountain", image: IMAGES.greenHills },
  community: { id: "community", label: "Community", blurb: "Volunteering and neighbourhood days", icon: "HeartHandshake", image: IMAGES.volunteers },
};

export const CATEGORY_LIST = Object.values(EVENT_CATEGORIES);

export const PLACES: RwandaPlace[] = ["Kigali", "Musanze", "Rubavu", "Huye", "Nyanza", "Karongi", "Nyungwe", "Akagera"];

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
};

/** Time windows offered on the public date rail. */
export const WHEN_OPTIONS = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "This weekend" },
  { value: "week", label: "Next 7 days" },
  { value: "month", label: "This month" },
] as const;

/** Lowest ticket price, or 0 when entry is free. */
export function eventFromPrice(tickets: Array<{ price: number }>, mode: string): number {
  if (mode === "free" || tickets.length === 0) return 0;
  return Math.min(...tickets.map((t) => t.price));
}

export function isFreeEvent(tickets: Array<{ price: number }>, mode: string): boolean {
  return eventFromPrice(tickets, mode) === 0;
}

/**
 * Statuses a customer may reach by direct link. `published` is the live set;
 * `completed` and `cancelled` stay reachable so someone holding a link sees why
 * the event is no longer on. Everything else (draft, pending_review, rejected)
 * does not exist as far as the public site is concerned — including its page
 * title. The store and the route's `generateMetadata` share this one rule.
 */
export function isPubliclyReachable(status: EventStatus): boolean {
  return status === "published" || status === "completed" || status === "cancelled";
}

export type WhenValue = (typeof WHEN_OPTIONS)[number]["value"];

/** Just the two fields a date window needs, so counts can run on partial records too. */
type DatedEvent = { date: string; endDate?: string };

/** Saturdays and Sundays inside the next seven days, today included. */
function weekendDays(now: Date): Date[] {
  return [0, 1, 2, 3, 4, 5, 6, 7].map((n) => addDays(now, n)).filter((d) => d.getDay() === 6 || d.getDay() === 0);
}

/**
 * Does an event fall inside one of the date-rail windows?
 *
 * Windows are whole days measured from midnight, never from the current clock: an event
 * that starts at 18:00 today still counts as "today" when you look at 20:00. A multi-day
 * run matches if any day of it overlaps the window.
 *
 * This is the single definition of what "today"/"this weekend"/"next 7 days" mean. The
 * store filters with it and the date rail counts with it, so the rail can never disagree
 * with the list underneath it.
 */
export function eventMatchesWhen(event: DatedEvent, when: WhenValue, now: Date = new Date()): boolean {
  if (when === "all") return true;
  const from = startOfDay(parseISO(event.date));
  const to = endOfDay(parseISO(event.endDate ?? event.date));
  const overlaps = (a: Date, b: Date) => from <= b && to >= a;
  switch (when) {
    case "today":
      return overlaps(startOfDay(now), endOfDay(now));
    case "tomorrow": {
      const t = addDays(now, 1);
      return overlaps(startOfDay(t), endOfDay(t));
    }
    case "weekend":
      return weekendDays(now).some((d) => overlaps(startOfDay(d), endOfDay(d)));
    case "week":
      return overlaps(startOfDay(now), endOfDay(addDays(now, 7)));
    case "month":
      return overlaps(startOfDay(now), endOfDay(addDays(now, 30)));
  }
}
