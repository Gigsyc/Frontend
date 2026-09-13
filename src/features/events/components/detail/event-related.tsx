"use client";

import { motion } from "motion/react";
import { EventCard, EventCardSkeleton } from "@/components/common";
import { ErrorState } from "@/components/ui/empty-state";
import { useEmployers } from "@/features/employers/queries";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";
import { useRelatedEvents } from "../../queries";
import { stagger } from "./utils";

interface RelatedProps {
  event: Event;
  savedIds: string[];
  onToggleSave: (event: Event) => void;
  /** Finished events lead with what is on next, so the section gets a surface of its own. */
  prominent?: boolean;
}

/** Three more events, titled by what actually connects them. Nothing to show means no section. */
export function EventRelated({ event, savedIds, onToggleSave, prominent }: RelatedProps) {
  const relatedQ = useRelatedEvents(event.id, 3);
  const employersQ = useEmployers();
  const related = relatedQ.data ?? [];

  if (relatedQ.isPending) {
    return (
      <section className="space-y-4">
        <div className="h-6 w-48 skeleton" aria-hidden />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <EventCardSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (relatedQ.isError) {
    return (
      <ErrorState
        title="We couldn't load more events"
        error={relatedQ.error}
        onRetry={() => void relatedQ.refetch()}
        retrying={relatedQ.isRefetching}
        compact
        className="rounded-lg bg-surface shadow-card"
      />
    );
  }

  if (related.length === 0) return null;

  const samePlace = related.every((e) => e.place === event.place);
  const heading = samePlace ? `More events in ${event.place}` : "You may also like";

  return (
    <section aria-labelledby="related-heading" className={cn("space-y-4", prominent && "rounded-lg bg-surface p-5 shadow-card sm:p-6")}>
      <div>
        <h2 id="related-heading" className="text-lg font-semibold">{heading}</h2>
        {prominent ? <p className="mt-0.5 text-sm text-fg-muted">This one has finished — here is what is coming up next.</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={stagger(i)}>
            <EventCard
              event={e}
              organizerName={employersQ.data?.find((emp) => emp.id === e.organizerId)?.name}
              saved={savedIds.includes(e.id)}
              onToggleSave={() => onToggleSave(e)}
              className="h-full"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
