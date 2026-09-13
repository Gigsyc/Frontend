"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useEmployers } from "@/features/employers/queries";
import { pluralize } from "@/lib/utils";
import type { Event, EventFilters, RwandaPlace } from "@/types";
import { useDestinations, useEvents } from "../../queries";
import { hasActiveFilters, toEventFilters, useEventFilters, useSavedEvents, whenCounts } from "../../hooks";
import { ActiveFilters } from "./active-filters";
import { BrowseByPlace } from "./browse-by-place";
import { CategoryRail } from "./category-rail";
import { DateRail } from "./date-rail";
import { EventResults } from "./event-results";
import { EventsSearch } from "./events-search";
import { FeaturedRail } from "./featured-rail";
import { FilterBar } from "./filter-bar";

/** Unfiltered baseline: the counts, the featured rail and the place grid all read from this one list. */
const ALL_EVENTS: EventFilters = {};

/** "38 events across Kigali, Musanze, Rubavu and beyond." */
function summarise(events: Event[]): string {
  const counts = new Map<RwandaPlace, number>();
  for (const event of events) counts.set(event.place, (counts.get(event.place) ?? 0) + 1);
  const places = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([place]) => place);
  const top = places.slice(0, 3);
  const where = places.length > 3
    ? `${top.join(", ")} and beyond`
    : top.length > 1 ? `${top.slice(0, -1).join(", ")} and ${top[top.length - 1]}` : top[0] ?? "Rwanda";
  return `${pluralize(events.length, "event")} across ${where}.`;
}

/** /events — the public board. Filters live in the URL; the saved view is the same board, bookmarked. */
export function EventsScreen() {
  const { state, update, clear, resetCount } = useEventFilters();
  const savedView = state.view === "saved";

  const all = useEvents(ALL_EVENTS);
  const results = useEvents(useMemo(() => toEventFilters(state), [state]));
  const employers = useEmployers();
  const destinations = useDestinations();
  const { savedIds, savedQuery, toggleSave } = useSavedEvents();

  const organizerById = useMemo(
    () => new Map((employers.data ?? []).map((e) => [e.id, e.name])),
    [employers.data],
  );
  const organizerName = useCallback((event: Event) => organizerById.get(event.organizerId), [organizerById]);
  const isSaved = useCallback((event: Event) => savedIds.has(event.id), [savedIds]);

  const counts = useMemo(() => whenCounts(all.data ?? []), [all.data]);
  const featured = useMemo(() => (all.data ?? []).filter((e) => e.featured).slice(0, 3), [all.data]);
  const bookmarked = useMemo(() => all.data?.filter((e) => savedIds.has(e.id)), [all.data, savedIds]);

  const filtersOn = hasActiveFilters(state);
  const shown = savedView
    ? {
      events: bookmarked,
      isPending: all.isPending || savedQuery.isPending,
      isError: all.isError || savedQuery.isError,
      error: all.error ?? savedQuery.error,
      isFetching: all.isFetching || savedQuery.isFetching,
      isRefetching: all.isRefetching || savedQuery.isRefetching,
      isStale: false,
      refetch: () => { void all.refetch(); void savedQuery.refetch(); },
    }
    : {
      events: results.data,
      isPending: results.isPending,
      isError: results.isError,
      error: results.error,
      isFetching: results.isFetching,
      isRefetching: results.isRefetching,
      isStale: results.isPlaceholderData && results.isFetching,
      refetch: () => { void results.refetch(); },
    };

  return (
    <div className="bg-canvas pb-16">
      <div className="container-x space-y-8 py-8 lg:py-10">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {savedView ? (
              <Link href="/events" className="inline-flex items-center gap-1 text-sm font-medium text-fg-muted transition-colors hover:text-fg">
                <ChevronLeft className="size-4" aria-hidden /> All events
              </Link>
            ) : null}
            <h1 className="mt-1 text-[28px] font-semibold leading-[1.14] sm:text-[34px]">
              {savedView ? "Saved events" : "What's happening in Rwanda"}
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-fg-muted">
              {savedView ? (
                bookmarked ? `${pluralize(bookmarked.length, "event")} you've bookmarked.` : "Your bookmarked events."
              ) : all.data ? (
                summarise(all.data)
              ) : (
                <span className="inline-block h-4 w-64 max-w-full align-middle skeleton" aria-hidden />
              )}
            </p>
          </div>
          {!savedView ? (
            <EventsSearch
              key={resetCount}
              query={state.query}
              onQuery={(query) => update({ query })}
              className="w-full lg:w-[360px]"
            />
          ) : null}
        </header>

        {!savedView ? (
          <>
            {!filtersOn ? (
              <FeaturedRail events={featured} organizerName={organizerName} isSaved={isSaved} onToggleSave={toggleSave} />
            ) : null}

            <div className="space-y-3">
              <DateRail value={state.when} onChange={(when) => update({ when })} counts={all.data ? counts : undefined} />
              <CategoryRail selected={state.categories} onChange={(categories) => update({ categories })} />
              <FilterBar state={state} onChange={update} resultCount={results.data?.length} />
              <ActiveFilters state={state} onChange={update} onClear={clear} />
            </div>
          </>
        ) : null}

        <EventResults
          events={shown.events}
          state={state}
          isPending={shown.isPending}
          isError={shown.isError}
          error={shown.error}
          isFetching={shown.isFetching}
          isRefetching={shown.isRefetching}
          isStale={shown.isStale}
          refetch={shown.refetch}
          organizerName={organizerName}
          isSaved={isSaved}
          onToggleSave={toggleSave}
          onClear={clear}
        />

        {!savedView && !filtersOn ? <BrowseByPlace destinations={destinations.data} events={all.data} /> : null}
      </div>
    </div>
  );
}
