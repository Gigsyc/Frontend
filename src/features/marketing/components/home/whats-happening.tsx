"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { EventCard, EventCardSkeleton } from "@/components/common/event-card";
import { ErrorState } from "@/components/ui/empty-state";
import { useEmployers } from "@/features/employers/queries";
import { useUpcomingEvents } from "@/features/events/hooks";
import { Section, SectionIntro } from "../section";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The city is alive, and GigSyc staffs it. Four events from the coming week, then straight
 * back to the product. Renders nothing when there is nothing on — but a failed load says so
 * and offers a retry, rather than looking like an empty city.
 */
export function WhatsHappening() {
  const { events, isPending, isError, isRefetching, refetch } = useUpcomingEvents(4);
  const employers = useEmployers();

  const organizerById = useMemo(
    () => new Map((employers.data ?? []).map((e) => [e.id, e.name])),
    [employers.data],
  );

  if (!isError && !isPending && !events?.length) return null;

  return (
    <Section>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionIntro
          eyebrow="Events"
          title="What's happening"
          lede="Concerts, festivals, markets and race days across Rwanda, listed by the organisers who run them."
        />
        <Link
          href="/events"
          className="-my-2.5 inline-flex items-center gap-1.5 py-2.5 text-sm font-medium text-navy-700 underline-offset-4 hover:underline [&_svg]:size-4"
        >
          View all events <ArrowRight aria-hidden />
        </Link>
      </div>

      {isError ? (
        <ErrorState
          title="We couldn't load events"
          onRetry={refetch}
          retrying={isRefetching}
          compact
          className="mt-10 rounded-lg bg-canvas"
        />
      ) : (
        <>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isPending || !events
              ? Array.from({ length: 4 }, (_, i) => <li key={i}><EventCardSkeleton /></li>)
              : events.map((event, i) => (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE, delay: i * 0.03 }}
                  className="flex"
                >
                  <EventCard event={event} className="w-full" organizerName={organizerById.get(event.organizerId)} />
                </motion.li>
              ))}
          </ul>

          <p className="mt-6 text-[13px] text-fg-subtle">Many of these are staffed by GigSyc professionals.</p>
        </>
      )}
    </Section>
  );
}
