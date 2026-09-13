"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { EventCard, EventCardSkeleton } from "@/components/common/event-card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { useEmployers } from "@/features/employers/queries";
import { useSavedEvents } from "@/features/events/hooks";
import { useEvents } from "@/features/events/queries";
import { pluralize } from "@/lib/utils";
import type { EventFilters } from "@/types";

const EASE = [0.22, 1, 0.36, 1] as const;
/** Same cache entry as the unfiltered board, so opening this tab rarely refetches. */
const ALL_EVENTS: EventFilters = { sort: "soonest" };

const GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

export function SavedTab() {
  const all = useEvents(ALL_EVENTS);
  const { savedIds, savedQuery, toggleSave } = useSavedEvents();
  const employers = useEmployers();

  const organizerById = useMemo(
    () => new Map((employers.data ?? []).map((e) => [e.id, e.name])),
    [employers.data],
  );
  const saved = useMemo(
    () => all.data?.filter((e) => savedIds.has(e.id)),
    [all.data, savedIds],
  );

  if (all.isPending || savedQuery.isPending) {
    return (
      <div className={GRID} aria-busy="true" aria-label="Loading your saved events">
        {Array.from({ length: 3 }, (_, i) => <EventCardSkeleton key={i} />)}
      </div>
    );
  }

  if (all.isError || savedQuery.isError || !saved) {
    return (
      <div className="rounded-lg bg-surface shadow-card">
        <ErrorState
          title="We couldn't load your saved events"
          error={all.error ?? savedQuery.error}
          retrying={all.isRefetching || savedQuery.isRefetching}
          onRetry={() => { void all.refetch(); void savedQuery.refetch(); }}
        />
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="rounded-lg bg-surface shadow-card">
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap the bookmark on any event and it waits for you here until you decide."
          action={<Button asChild className="h-11"><Link href="/events">Browse events</Link></Button>}
        />
      </div>
    );
  }

  // Bookmarks outlive the board: anything finished or withdrawn is no longer public, so say so
  // rather than quietly showing fewer events than the customer saved.
  const hidden = savedIds.size - saved.length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-muted">
        {pluralize(saved.length, "event")} you&apos;ve bookmarked.
        {hidden > 0 ? ` ${pluralize(hidden, "other")} ${hidden === 1 ? "has" : "have"} finished or been withdrawn.` : ""}
      </p>
      <ul className={GRID}>
        {saved.map((event, i) => (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: Math.min(i, 6) * 0.03 }}
            className="flex"
          >
            <EventCard
              event={event}
              className="w-full"
              organizerName={organizerById.get(event.organizerId)}
              saved
              onToggleSave={() => toggleSave(event)}
            />
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
