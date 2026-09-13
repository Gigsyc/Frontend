"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EVENT_CATEGORIES, PLACES, WHEN_OPTIONS, type WhenValue } from "@/data/events";
import type { EventCategory, EventFilters, RwandaPlace } from "@/types";

export type EventSort = NonNullable<EventFilters["sort"]>;
export type PriceFilter = NonNullable<EventFilters["price"]>;
export type EventsView = "all" | "saved";

/** Everything /events can be narrowed by. Lives in the URL so a filtered board is shareable. */
export interface EventsFilterState {
  query: string;
  when: WhenValue;
  categories: EventCategory[];
  place: RwandaPlace | "all";
  price: PriceFilter;
  sort: EventSort;
  view: EventsView;
}

export const DEFAULT_EVENTS_STATE: EventsFilterState = {
  query: "",
  when: "all",
  categories: [],
  place: "all",
  price: "all",
  sort: "soonest",
  view: "all",
};

export const SORT_OPTIONS: Array<{ value: EventSort; label: string }> = [
  { value: "soonest", label: "Soonest" },
  { value: "popular", label: "Most popular" },
  { value: "price_asc", label: "Price low to high" },
  { value: "newest", label: "Newly added" },
];

export const PRICE_OPTIONS: Array<{ value: PriceFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

/** How the sort reads in the result-count line: "38 events · soonest first". */
export const SORT_SUFFIX: Record<EventSort, string> = {
  soonest: "soonest first",
  popular: "most popular first",
  price_asc: "price, low to high",
  newest: "newly added first",
};

const WHEN_PHRASE: Record<WhenValue, string> = {
  all: "",
  today: " today",
  tomorrow: " tomorrow",
  weekend: " this weekend",
  week: " in the next 7 days",
  month: " this month",
};

interface ParamsLike {
  get(name: string): string | null;
}

const isCategory = (v: string): v is EventCategory => v in EVENT_CATEGORIES;
const isPlace = (v: string | null): v is RwandaPlace => !!v && (PLACES as string[]).includes(v);
const isWhen = (v: string | null): v is WhenValue => WHEN_OPTIONS.some((o) => o.value === v);
const isSort = (v: string | null): v is EventSort => SORT_OPTIONS.some((o) => o.value === v);
const isPrice = (v: string | null): v is PriceFilter => PRICE_OPTIONS.some((o) => o.value === v);

export function parseEventParams(sp: ParamsLike): EventsFilterState {
  const when = sp.get("when");
  const sort = sp.get("sort");
  const price = sp.get("price");
  const place = sp.get("place");
  return {
    query: sp.get("q") ?? "",
    when: isWhen(when) ? when : "all",
    categories: (sp.get("cat") ?? "").split(",").filter(Boolean).filter(isCategory),
    place: isPlace(place) ? place : "all",
    price: isPrice(price) ? price : "all",
    sort: isSort(sort) ? sort : "soonest",
    view: sp.get("view") === "saved" ? "saved" : "all",
  };
}

export function serializeEventParams(s: EventsFilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (s.view === "saved") p.set("view", "saved");
  if (s.query.trim()) p.set("q", s.query.trim());
  if (s.when !== "all") p.set("when", s.when);
  if (s.categories.length) p.set("cat", s.categories.join(","));
  if (s.place !== "all") p.set("place", s.place);
  if (s.price !== "all") p.set("price", s.price);
  if (s.sort !== "soonest") p.set("sort", s.sort);
  return p;
}

/** Filters handed to `useEvents`. Every narrowing, `when` included, is applied by the store. */
export function toEventFilters(s: EventsFilterState): EventFilters {
  const f: EventFilters = { sort: s.sort };
  if (s.when !== "all") f.when = s.when;
  if (s.query.trim()) f.query = s.query.trim();
  if (s.categories.length) f.categories = s.categories;
  if (s.place !== "all") f.places = [s.place];
  if (s.price !== "all") f.price = s.price;
  return f;
}

export function hasActiveFilters(s: EventsFilterState): boolean {
  return !!s.query.trim() || s.when !== "all" || s.categories.length > 0 || s.place !== "all" || s.price !== "all";
}

/** Filters that live behind the mobile "Filters" sheet — drives its count badge. */
export function sheetFilterCount(s: EventsFilterState): number {
  return (s.place !== "all" ? 1 : 0) + (s.price !== "all" ? 1 : 0) + (s.sort !== "soonest" ? 1 : 0);
}

/**
 * A patch is either the fields to set, or a function of the state it lands on. Anything derived
 * from the current state — the category list, which is added to rather than replaced — must use
 * the function form, or two quick toggles would each build on the same pre-toggle array.
 */
export type EventsFilterPatch =
  | Partial<EventsFilterState>
  | ((prev: EventsFilterState) => Partial<EventsFilterState>);

/** Add or remove one category, against whatever the live state is when it applies. */
export const toggleCategory =
  (id: EventCategory) =>
    (prev: EventsFilterState): Partial<EventsFilterState> => ({
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    });

export interface ActiveFilterChip {
  key: string;
  label: string;
  patch: EventsFilterPatch;
}

export function activeFilterChips(s: EventsFilterState): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  if (s.query.trim()) chips.push({ key: "q", label: `"${s.query.trim()}"`, patch: { query: "" } });
  if (s.when !== "all") {
    const label = WHEN_OPTIONS.find((o) => o.value === s.when)?.label ?? "";
    chips.push({ key: "when", label, patch: { when: "all" } });
  }
  for (const c of s.categories) {
    chips.push({ key: `cat-${c}`, label: EVENT_CATEGORIES[c].label, patch: toggleCategory(c) });
  }
  if (s.place !== "all") chips.push({ key: "place", label: s.place, patch: { place: "all" } });
  if (s.price !== "all") chips.push({ key: "price", label: s.price === "free" ? "Free" : "Paid", patch: { price: "all" } });
  return chips;
}

/** "No free music events in Musanze this weekend." — the empty state names what was asked for. */
export function emptyResultLine(s: EventsFilterState): string {
  const price = s.price === "free" ? "free" : s.price === "paid" ? "paid" : "";
  const category = s.categories.length === 1 ? EVENT_CATEGORIES[s.categories[0]].label.toLowerCase() : "";
  const subject = [price, category, "events"].filter(Boolean).join(" ");
  const query = s.query.trim() ? ` matching "${s.query.trim()}"` : "";
  const place = s.place !== "all" ? ` in ${s.place}` : "";
  return `No ${subject}${query}${place}${WHEN_PHRASE[s.when]}.`;
}

/**
 * Filter state in the URL. `resetCount` bumps on clear so the uncontrolled search box can
 * remount instead of fighting a pending debounce.
 */
export function useEventFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [resetCount, setResetCount] = useState(0);

  const state = useMemo(() => parseEventParams(searchParams), [searchParams]);

  // `state` only catches up once the replace has committed, so two chip toggles in quick
  // succession would both build on the pre-first-toggle URL and the first would be lost.
  // `latest` is the newest intent: writes update it immediately, and an incoming URL we did
  // not write ourselves (back/forward, a deep link, a Link elsewhere on the page) replaces it.
  const latest = useRef(state);
  const inFlight = useRef<string[]>([]);

  useEffect(() => {
    const qs = serializeEventParams(state).toString();
    const i = inFlight.current.indexOf(qs);
    if (i === -1) {
      inFlight.current = [];
      latest.current = state;
    } else {
      inFlight.current = inFlight.current.slice(i + 1);
    }
  }, [state]);

  const replace = useCallback(
    (next: EventsFilterState) => {
      const qs = serializeEventParams(next).toString();
      const current = inFlight.current.at(-1) ?? serializeEventParams(latest.current).toString();
      latest.current = next;
      if (qs === current) return;
      inFlight.current = [...inFlight.current, qs];
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const update = useCallback(
    (patch: EventsFilterPatch) => {
      const base = latest.current;
      replace({ ...base, ...(typeof patch === "function" ? patch(base) : patch) });
    },
    [replace],
  );

  const clear = useCallback(() => {
    replace({ ...DEFAULT_EVENTS_STATE, view: latest.current.view });
    setResetCount((c) => c + 1);
  }, [replace]);

  return { state, update, clear, resetCount };
}
