import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { shiftHours } from "@/lib/utils";
import type { SubmitState } from "./state";

export type StepErrors = Partial<Record<keyof SubmitState, string>>;

export const TITLE_MIN = 6;
export const TITLE_MAX = 90;
export const TAGLINE_MAX = 120;
export const DESCRIPTION_MIN = 60;
export const HIGHLIGHTS_MAX = 6;
export const TIERS_MAX = 4;
export const GOOD_TO_KNOW_MAX = 4;
export const CAPACITY_MIN = 10;
export const GALLERY_MAX = 3;

export const todayIso = () => format(new Date(), "yyyy-MM-dd");

const filled = (lines: string[]) => lines.filter((l) => l.trim());

export function validateStep(step: number, s: SubmitState): StepErrors {
  const e: StepErrors = {};
  if (step === 0) {
    const title = s.title.trim();
    if (!title) e.title = "Give your event a name people will search for.";
    else if (title.length < TITLE_MIN) e.title = `A title needs at least ${TITLE_MIN} characters.`;
    else if (title.length > TITLE_MAX) e.title = `Keep the title under ${TITLE_MAX} characters.`;
    if (!s.tagline.trim()) e.tagline = "Add the one line people see on the card.";
    else if (s.tagline.trim().length > TAGLINE_MAX) e.tagline = `Keep the tagline under ${TAGLINE_MAX} characters.`;
    if (!s.category) e.category = "Pick the category that fits best — it decides where guests find you.";
    if (s.description.trim().length < DESCRIPTION_MIN) e.description = `Tell guests what to expect — at least ${DESCRIPTION_MIN} characters.`;
    const highlights = filled(s.highlights);
    if (!highlights.length) e.highlights = "Add at least one highlight.";
    else if (highlights.length > HIGHLIGHTS_MAX) e.highlights = `Up to ${HIGHLIGHTS_MAX} highlights.`;
    else if (highlights.some((h) => h.trim().length > 80)) e.highlights = "Keep each highlight to a short line.";
  }
  if (step === 1) {
    if (!s.date) e.date = "Choose the date.";
    else if (s.date < todayIso()) e.date = "That date has already passed.";
    if (s.multiDay) {
      if (!s.endDate) e.endDate = "Choose the last day.";
      else if (s.date && s.endDate < s.date) e.endDate = "The last day can't be before the first.";
    }
    if (!s.startTime) e.startTime = "Set a start time.";
    if (!s.endTime) e.endTime = "Set an end time.";
    if (s.startTime && s.endTime && s.startTime === s.endTime && !s.multiDay) e.endTime = "Start and end can't be the same time.";
    if (s.doorsOpen && s.startTime && s.doorsOpen > s.startTime && s.startTime >= "04:00") e.doorsOpen = "Doors usually open before the start time.";
    if (!s.venue.trim()) e.venue = "Where is it? Guests see this on the card.";
    if (!s.place) e.place = "Pick the town or park.";
    if (!s.address.trim()) e.address = "Add a street or landmark so guests can find you.";
  }
  if (step === 2) {
    const cap = Number(s.capacity);
    if (!s.capacity.trim()) e.capacity = "How many guests can you host?";
    else if (!Number.isInteger(cap) || cap < CAPACITY_MIN) e.capacity = `Capacity needs to be a whole number of at least ${CAPACITY_MIN}.`;
    if (s.attendanceMode === "tickets") {
      if (!s.tiers.length) e.tiers = "Add at least one ticket type.";
      else if (s.tiers.length > TIERS_MAX) e.tiers = `Up to ${TIERS_MAX} ticket types.`;
      else if (s.tiers.some((t) => !t.name.trim())) e.tiers = "Every ticket type needs a name.";
      else if (s.tiers.some((t) => !t.price.trim() || !Number.isFinite(Number(t.price)) || Number(t.price) < 0)) e.tiers = "Prices must be a whole number of francs — 0 for free.";
    }
    if (filled(s.goodToKnow).length > GOOD_TO_KNOW_MAX) e.goodToKnow = `Up to ${GOOD_TO_KNOW_MAX} notes.`;
  }
  if (step === 3) {
    if (!s.coverImage) e.coverImage = "Pick a cover photo — it's the first thing guests see.";
  }
  return e;
}

/**
 * Submitting needs every step to pass. A draft only needs the basics — a title and category
 * to recognise it by — because a draft exists precisely for an event that isn't worked out yet.
 */
export function firstInvalidStep(s: SubmitState, intent: "submit" | "draft"): number | null {
  const last = intent === "draft" ? 1 : 4;
  for (let i = 0; i < last; i++) if (Object.keys(validateStep(i, s)).length) return i;
  return null;
}

/** "Runs 7h 30m" · "Runs 3 days · 07:00–17:30 each day" · "Runs 8h · finishes after midnight". */
export function runsLabel(s: Pick<SubmitState, "date" | "endDate" | "multiDay" | "startTime" | "endTime">): string | null {
  if (!s.startTime || !s.endTime) return null;
  if (s.multiDay && s.date && s.endDate && s.endDate >= s.date) {
    const days = differenceInCalendarDays(parseISO(s.endDate), parseISO(s.date)) + 1;
    return `Runs ${days} day${days === 1 ? "" : "s"} · ${s.startTime}–${s.endTime} each day`;
  }
  const hours = shiftHours(s.startTime, s.endTime);
  if (hours <= 0) return null;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const length = m ? `${h}h ${m}m` : `${h}h`;
  return `Runs ${length}${s.endTime < s.startTime ? " · finishes after midnight" : ""}`;
}
