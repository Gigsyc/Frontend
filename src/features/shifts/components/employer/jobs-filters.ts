import type { Shift } from "@/types";
import type { BookingCounts } from "./shift-helpers";
import { EMPTY_COUNTS } from "./shift-helpers";

export type StatusFilter = "all" | "open" | "filled" | "in_progress" | "completed" | "draft" | "cancelled";
export type JobSort = "soonest" | "newest" | "open_positions";

export const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "filled", label: "Filled" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Drafts" },
  { value: "cancelled", label: "Cancelled" },
];

export const JOB_SORTS: Array<{ value: JobSort; label: string }> = [
  { value: "soonest", label: "Soonest" },
  { value: "newest", label: "Newest" },
  { value: "open_positions", label: "Most positions open" },
];

export const EMPTY_COPY: Record<StatusFilter, { title: string; description: string }> = {
  all: { title: "No shifts match", description: "Try a different search or clear the status filter." },
  open: { title: "No open shifts", description: "Everything you've posted is filled, finished or still a draft." },
  filled: { title: "No filled shifts", description: "Shifts move here once every position is confirmed." },
  in_progress: { title: "Nothing in progress", description: "Shifts appear here from the first check-in until the last check-out." },
  completed: { title: "No completed shifts", description: "Finished shifts land here, ready for you to approve and rate." },
  draft: { title: "No drafts", description: "Save a shift as a draft at any step of the wizard and come back to it later." },
  cancelled: { title: "No cancelled shifts", description: "Shifts you call off land here so you keep the record." },
};

/** What the toolbar owns. `applicationsOnly` lives in the URL, not in toolbar state. */
export interface JobsFilterState {
  search: string;
  status: StatusFilter;
  sort: JobSort;
}

export interface JobsQuery extends JobsFilterState {
  applicationsOnly: boolean;
}

export function countByStatus(shifts: Shift[]): Record<StatusFilter, number> {
  const c: Record<StatusFilter, number> = { all: shifts.length, open: 0, filled: 0, in_progress: 0, completed: 0, draft: 0, cancelled: 0 };
  for (const s of shifts) if (s.status in c) c[s.status as Exclude<StatusFilter, "all">] += 1;
  return c;
}

export function filterAndSortJobs(shifts: Shift[], counts: Record<string, BookingCounts>, q: JobsQuery): Shift[] {
  const needle = q.search.trim().toLowerCase();
  const out = shifts.filter((s) => {
    if (q.status !== "all" && s.status !== q.status) return false;
    if (q.applicationsOnly && !(counts[s.id]?.applied)) return false;
    if (needle && !`${s.title} ${s.venue}`.toLowerCase().includes(needle)) return false;
    return true;
  });
  const openPositions = (s: Shift) => Math.max(0, s.workersNeeded - (counts[s.id] ?? EMPTY_COUNTS).filled);
  return out.sort((a, b) => {
    switch (q.sort) {
      case "newest": return b.createdAt.localeCompare(a.createdAt);
      case "open_positions": return openPositions(b) - openPositions(a) || a.date.localeCompare(b.date);
      default: return `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`);
    }
  });
}
