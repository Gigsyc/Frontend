import { isBefore, parseISO } from "date-fns";
import type { Event, EventStatus } from "@/types";

/** What a partner reads for each status. Colour still comes from the shared EventStatusBadge. */
export const PARTNER_STATUS_LABEL: Record<EventStatus, string> = {
  draft: "Draft — only you can see this",
  pending_review: "With GigSyc for review",
  published: "Live on GigSyc",
  rejected: "Needs changes",
  cancelled: "Cancelled",
  completed: "Finished",
};

export type OrganizerStatusFilter = "all" | "live" | "review" | "drafts" | "changes" | "past";

export const STATUS_FILTERS: Array<{ value: OrganizerStatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "review", label: "With GigSyc" },
  { value: "drafts", label: "Drafts" },
  { value: "changes", label: "Needs changes" },
  { value: "past", label: "Past" },
];

const FILTER_STATUSES: Record<Exclude<OrganizerStatusFilter, "all">, readonly EventStatus[]> = {
  live: ["published"],
  review: ["pending_review"],
  drafts: ["draft"],
  changes: ["rejected"],
  past: ["completed", "cancelled"],
};

export const isStatusFilter = (v: string | null): v is OrganizerStatusFilter =>
  !!v && STATUS_FILTERS.some((f) => f.value === v);

/** Groups what the hook returned for presentation — the store already scoped it to this partner. */
export function groupByFilter(events: Event[], filter: OrganizerStatusFilter): Event[] {
  if (filter === "all") return events;
  const set = FILTER_STATUSES[filter];
  return events.filter((e) => set.includes(e.status));
}

export function countByFilter(events: Event[]): Record<OrganizerStatusFilter, number> {
  return {
    all: events.length,
    live: groupByFilter(events, "live").length,
    review: groupByFilter(events, "review").length,
    drafts: groupByFilter(events, "drafts").length,
    changes: groupByFilter(events, "changes").length,
    past: groupByFilter(events, "past").length,
  };
}

export const EMPTY_COPY: Record<OrganizerStatusFilter, { title: string; description: string }> = {
  all: { title: "No events match", description: "Try another filter." },
  live: { title: "Nothing live right now", description: "Events appear here once GigSyc approves them — usually within a day of you submitting." },
  review: { title: "Nothing with GigSyc", description: "Submit a draft and it shows here while we review it." },
  drafts: { title: "No drafts", description: "Start an event and save it as a draft to come back to later." },
  changes: { title: "Nothing needs changes — good sign.", description: "If GigSyc asks for changes to an event, it shows here with their note." },
  past: { title: "No past events yet", description: "Finished and cancelled events land here so you keep the record." },
};

/** True once the event's last day has ended (a past-midnight end counts as the end of that day). */
export function isEventOver(event: Pick<Event, "date" | "endDate" | "startTime" | "endTime">): boolean {
  const last = event.endDate ?? event.date;
  const end = event.endTime < event.startTime ? "23:59" : event.endTime;
  return isBefore(parseISO(`${last}T${end}`), new Date());
}

/** The soonest live or queued event still to come. The list arrives soonest-first, so the first match wins. */
export function pickUpNext(events: Event[]): Event | undefined {
  return events.find((e) => (e.status === "published" || e.status === "pending_review") && !isEventOver(e));
}

export const spotsLeft = (e: Pick<Event, "capacity" | "attending">) => Math.max(0, e.capacity - e.attending);
export const fillPercent = (e: Pick<Event, "capacity" | "attending">) => (e.capacity > 0 ? Math.min(100, (e.attending / e.capacity) * 100) : 0);

export const editHref = (id: string) => `/employer/events/new?edit=${id}`;
export const publicHref = (slug: string) => `/events/${slug}`;
export const detailHref = (id: string) => `/employer/events/${id}`;

/** Statuses a partner may still edit. The store enforces this; the UI only reflects it. */
export const EDITABLE: ReadonlySet<EventStatus> = new Set<EventStatus>(["draft", "pending_review", "rejected"]);

export { isNotFoundError as isNotFound, errorMessage } from "@/lib/utils";
