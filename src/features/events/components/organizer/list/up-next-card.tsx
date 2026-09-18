"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Users } from "lucide-react";
import { EventCard, EventCardSkeleton } from "@/components/common/event-card";
import { EventStatusBadge } from "@/components/ui";
import { EASE } from "@/lib/motion";
import { pluralize } from "@/lib/utils";
import type { Event } from "@/types";
import { detailHref, PARTNER_STATUS_LABEL, spotsLeft } from "./organizer-helpers";

/**
 * The promoter's lead metric: the next event and who is coming. One wide card, no save
 * button (it's their own event), two quiet lines underneath.
 */
export function UpNextCard({ event }: { event: Event }) {
  return (
    <motion.section aria-labelledby="up-next-heading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <h2 id="up-next-heading" className="text-lg font-semibold">Up next</h2>
        {event.status === "published" ? (
          <Link href={`/events/${event.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-navy-700 hover:underline sm:min-h-0">
            View on GigSyc <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
      <EventCard event={event} emphasis="hero" priority href={detailHref(event.id)} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-fg-muted">
        <span className="inline-flex items-center gap-1.5 tabular">
          <Users className="size-4 text-fg-subtle" aria-hidden />
          <span className="font-medium text-fg">{event.attending.toLocaleString("en-US")} going</span>
          <span aria-hidden>·</span>
          {pluralize(spotsLeft(event), "spot")} left
        </span>
        <span className="inline-flex items-center gap-2">
          <EventStatusBadge status={event.status} />
          {PARTNER_STATUS_LABEL[event.status]}
        </span>
      </div>
    </motion.section>
  );
}

export function UpNextCardSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="skeleton h-6 w-24" />
      <EventCardSkeleton emphasis="hero" />
      <div className="skeleton h-4 w-64" />
    </div>
  );
}
