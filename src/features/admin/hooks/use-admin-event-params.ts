"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { EVENT_CATEGORIES, EVENT_STATUS_LABEL, PLACES } from "@/data/events";
import type { AdminEventFilters, EventCategory, EventStatus, RwandaPlace } from "@/types";

export type StatusTab = EventStatus | "all";
export type AdminEventSort = NonNullable<AdminEventFilters["sort"]>;

/** Tab order follows the queue, not the alphabet: what needs a decision sits second. */
export const STATUS_TABS: Array<{ value: StatusTab; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending_review", label: EVENT_STATUS_LABEL.pending_review },
  { value: "published", label: EVENT_STATUS_LABEL.published },
  { value: "draft", label: EVENT_STATUS_LABEL.draft },
  { value: "rejected", label: EVENT_STATUS_LABEL.rejected },
  { value: "cancelled", label: EVENT_STATUS_LABEL.cancelled },
  { value: "completed", label: EVENT_STATUS_LABEL.completed },
];

export const ADMIN_EVENT_SORTS: Array<{ value: AdminEventSort; label: string }> = [
  { value: "soonest", label: "Soonest" },
  { value: "submitted", label: "Recently submitted" },
  { value: "title", label: "Title A–Z" },
];

export interface AdminEventFilterState {
  q: string;
  status: StatusTab;
  category: EventCategory | "";
  place: RwandaPlace | "";
  sort: AdminEventSort;
}

const isStatusTab = (v: string): v is StatusTab => v === "all" || v in EVENT_STATUS_LABEL;
const isCategory = (v: string): v is EventCategory => v in EVENT_CATEGORIES;
const isPlace = (v: string): v is RwandaPlace => (PLACES as string[]).includes(v);
const isSort = (v: string): v is AdminEventSort => ADMIN_EVENT_SORTS.some((s) => s.value === v);

type ParamReader = { get(name: string): string | null };

/** URL → state. A mangled or stale link falls back to the default rather than showing nothing. */
export function parseAdminEventParams(sp: ParamReader): AdminEventFilterState {
  const status = sp.get("status") ?? "";
  const category = sp.get("category") ?? "";
  const place = sp.get("place") ?? "";
  const sort = sp.get("sort") ?? "";
  return {
    q: sp.get("q") ?? "",
    status: isStatusTab(status) ? status : "all",
    category: isCategory(category) ? category : "",
    place: isPlace(place) ? place : "",
    sort: isSort(sort) ? sort : "soonest",
  };
}

export function countActiveFilters(s: AdminEventFilterState) {
  return [s.q.trim() !== "", s.category !== "", s.place !== ""].filter(Boolean).length;
}

/**
 * Filters live in the URL (?status=&q=&category=&place=&sort=) so the Overview can deep-link
 * straight into the review queue and an operations person can share "these five, please".
 */
export function useAdminEventParams() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state = useMemo(() => parseAdminEventParams(sp), [sp]);

  /** Everything except status — the tab counts are measured against this. */
  const baseFilters = useMemo<AdminEventFilters>(() => {
    const f: AdminEventFilters = {};
    const q = state.q.trim();
    if (q) f.query = q;
    if (state.category) f.categories = [state.category];
    if (state.place) f.places = [state.place];
    return f;
  }, [state.q, state.category, state.place]);

  const listFilters = useMemo<AdminEventFilters>(
    () => ({ ...baseFilters, sort: state.sort, ...(state.status === "all" ? {} : { statuses: [state.status] }) }),
    [baseFilters, state.sort, state.status],
  );

  const update = useCallback(
    (patch: Partial<AdminEventFilterState>) => {
      const next = { ...parseAdminEventParams(sp), ...patch };
      const params = new URLSearchParams(sp.toString());
      const put = (key: string, value: string | undefined) => (value ? params.set(key, value) : params.delete(key));
      put("q", next.q.trim() || undefined);
      put("status", next.status !== "all" ? next.status : undefined);
      put("category", next.category || undefined);
      put("place", next.place || undefined);
      put("sort", next.sort !== "soonest" ? next.sort : undefined);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [sp, router, pathname],
  );

  const clear = useCallback(() => update({ q: "", category: "", place: "" }), [update]);

  return { state, baseFilters, listFilters, update, clear, activeCount: countActiveFilters(state) };
}
