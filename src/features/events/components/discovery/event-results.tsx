"use client";

import Link from "next/link";
import { BookmarkX, CalendarSearch } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { EventCard, EventCardSkeleton } from "@/components/common/event-card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { cn, pluralize } from "@/lib/utils";
import type { Event } from "@/types";
import { emptyResultLine, SORT_SUFFIX, type EventsFilterState } from "../../hooks";

const EASE = [0.22, 1, 0.36, 1] as const;

interface EventResultsProps {
  events: Event[] | undefined;
  state: EventsFilterState;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  isRefetching: boolean;
  /** Showing the previous list while a new filter set loads. */
  isStale: boolean;
  refetch: () => void;
  organizerName: (event: Event) => string | undefined;
  isSaved: (event: Event) => boolean;
  onToggleSave: (event: Event) => void;
  onClear: () => void;
}

export function EventResults(props: EventResultsProps) {
  const { events, state, isPending, isError, error, isFetching, isRefetching, isStale, refetch, onClear } = props;
  const saved = state.view === "saved";
  const heading = saved ? "Saved events" : "All events";

  if (isPending) return <ResultsSkeleton heading={heading} />;

  if (isError || !events) {
    return (
      <ErrorState
        title="We couldn't load events"
        error={error}
        onRetry={refetch}
        retrying={isRefetching}
        className="rounded-lg bg-surface shadow-card"
      />
    );
  }

  if (events.length === 0) {
    return saved ? (
      <EmptyState
        icon={BookmarkX}
        title="Nothing saved yet"
        description="Tap the bookmark on any event and it will wait for you here."
        action={<Button asChild><Link href="/events">Browse events</Link></Button>}
        className="rounded-lg bg-surface shadow-card"
      />
    ) : (
      <EmptyState
        icon={CalendarSearch}
        title={emptyResultLine(state)}
        description="Try another date or explore all upcoming events."
        action={<Button variant="outline" onClick={onClear}>Clear filters</Button>}
        className="rounded-lg bg-surface shadow-card"
      />
    );
  }

  return (
    <section aria-label={heading} className="space-y-4">
      <p role="status" className="flex items-center gap-2 text-[13px] text-fg-muted">
        <span><span className="font-medium text-fg tabular">{pluralize(events.length, "event")}</span>{saved ? "" : ` · ${SORT_SUFFIX[state.sort]}`}</span>
        {isFetching ? <Spinner label="Updating events" /> : null}
      </p>
      <EventGrid
        events={events}
        isStale={isStale}
        organizerName={props.organizerName}
        isSaved={props.isSaved}
        onToggleSave={props.onToggleSave}
      />
    </section>
  );
}

function EventGrid({ events, organizerName, isSaved, onToggleSave, isStale }: Pick<EventResultsProps, "organizerName" | "isSaved" | "onToggleSave" | "isStale"> & { events: Event[] }) {
  // Stagger only the first list that lands; later filter changes should feel instant.
  const [stagger, setStagger] = useState(true);

  return (
    <ul className={cn("grid gap-4 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3", isStale && "opacity-60")}>
      {events.map((event, i) => (
        <motion.li
          key={event.id}
          initial={stagger ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE, delay: stagger ? Math.min(i, 8) * 0.03 : 0 }}
          onAnimationComplete={() => setStagger(false)}
          className="flex"
        >
          <EventCard
            event={event}
            className="w-full"
            organizerName={organizerName(event)}
            saved={isSaved(event)}
            onToggleSave={() => onToggleSave(event)}
          />
        </motion.li>
      ))}
    </ul>
  );
}

export function ResultsSkeleton({ heading, count = 6 }: { heading?: string; count?: number }) {
  return (
    <section aria-busy="true" aria-label={heading ? `Loading ${heading.toLowerCase()}` : "Loading events"} className="space-y-4">
      <div className="h-4 w-40 skeleton" aria-hidden />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => <li key={i}><EventCardSkeleton /></li>)}
      </ul>
    </section>
  );
}
