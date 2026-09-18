import { EVENT_CATEGORIES } from "@/data/events";
import { IMAGES } from "@/data/images";
import type { OrganizerEventInput } from "@/features/events";
import type { Event, TicketTier } from "@/types";
import type { SubmitState } from "./state";
import { todayIso } from "./validation";

/** The twelve covers a partner can pick from. Fixed subset of IMAGES that reads as "an event". */
export const COVER_CHOICES: Array<{ src: string; label: string }> = [
  { src: IMAGES.concertStage, label: "Concert stage" },
  { src: IMAGES.liveMusic, label: "Live music" },
  { src: IMAGES.musicCrowd, label: "Crowd at a gig" },
  { src: IMAGES.festivalCrowd, label: "Festival crowd" },
  { src: IMAGES.festivalStage, label: "Festival stage" },
  { src: IMAGES.foodPlates, label: "Plates of food" },
  { src: IMAGES.foodCommunal, label: "Shared table" },
  { src: IMAGES.cocktailsNeon, label: "Cocktails" },
  { src: IMAGES.cultureCrowd, label: "Cultural gathering" },
  { src: IMAGES.familyKids, label: "Family day" },
  { src: IMAGES.greenHills, label: "Green hills" },
  { src: IMAGES.conferenceHall, label: "Conference hall" },
];

export function slugify(title: string): string {
  return title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const lines = (items: string[]) => items.map((l) => l.trim()).filter(Boolean);

function buildTickets(s: SubmitState): TicketTier[] {
  if (s.attendanceMode !== "tickets") return [];
  return s.tiers.map((t) => {
    const price = Math.max(0, Math.round(Number(t.price) || 0));
    const description = t.description.trim();
    return { id: t.id, name: t.name.trim(), price, ...(description ? { description } : {}) };
  });
}

/**
 * Turn the wizard state into the input the store expects.
 * Submitting only happens once every step validates. Drafts can be saved from step one, so the
 * fields the partner hasn't reached yet fall back to values the rest of the app can render.
 */
export function buildEventInput(s: SubmitState, asDraft: boolean): OrganizerEventInput {
  const category = s.category ?? "community";
  const capacity = Math.round(Number(s.capacity));
  const date = s.date || todayIso();
  return {
    slug: slugify(s.title.trim()),
    title: s.title.trim(),
    tagline: s.tagline.trim(),
    description: s.description.trim(),
    highlights: lines(s.highlights),
    category,
    place: s.place || "Kigali",
    venue: s.venue.trim(),
    address: s.address.trim(),
    date,
    ...(s.multiDay && s.endDate && s.endDate > date ? { endDate: s.endDate } : {}),
    startTime: s.startTime,
    endTime: s.endTime,
    ...(s.doorsOpen ? { doorsOpen: s.doorsOpen } : {}),
    coverImage: s.coverImage || EVENT_CATEGORIES[category].image,
    gallery: s.gallery.filter((g) => g !== s.coverImage),
    attendanceMode: s.attendanceMode,
    tickets: buildTickets(s),
    capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 100,
    ...(s.ageRestriction ? { ageRestriction: s.ageRestriction } : {}),
    accessibility: [...s.accessibility, ...lines(s.accessibilityExtra)],
    goodToKnow: lines(s.goodToKnow),
    asDraft,
  };
}

/** A preview Event for the review step's card — exactly what the public would see once live. */
export function previewEvent(s: SubmitState, organizerId: string): Event {
  const { asDraft: _draft, ...fields } = buildEventInput(s, false);
  void _draft;
  return {
    ...fields,
    id: "preview",
    organizerId,
    status: "pending_review",
    featured: false,
    attending: 0,
    createdAt: new Date().toISOString(),
    staffedShiftIds: [],
  };
}

type EditableKey = Exclude<keyof OrganizerEventInput, "asDraft">;

/**
 * Only the fields that actually changed, so an edit reads as an edit in the store and we never
 * overwrite something with an identical copy. Optional fields the partner cleared are sent as
 * `undefined` so the store drops them.
 */
export function changedFields(original: Event, next: OrganizerEventInput): Partial<Event> {
  const { asDraft: _draft, ...fields } = next;
  void _draft;
  const patch: Partial<Event> = {};
  const optional: EditableKey[] = ["endDate", "doorsOpen", "ageRestriction"];
  const keys = new Set<EditableKey>([...(Object.keys(fields) as EditableKey[]), ...optional]);
  // The slug is the event's public address; a retitle must not move it.
  keys.delete("slug");
  for (const key of keys) {
    const before = original[key];
    const after = fields[key];
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      (patch as Record<string, unknown>)[key] = after;
    }
  }
  return patch;
}
