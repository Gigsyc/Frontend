"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { EventCard, EventCardSkeleton } from "@/components/common/event-card";
import { ErrorState } from "@/components/ui/empty-state";
import { useAuth } from "@/features/auth";
import { useEmployers } from "@/features/employers/queries";
import { useUpcomingEvents } from "@/features/events/hooks";
import { useEvents } from "@/features/events/queries";
import type { EventFilters } from "@/types";
import { Section, SectionIntro } from "../section";

const EASE = [0.22, 1, 0.36, 1] as const;
const LIMIT = 4;
/** The same cache entry `useUpcomingEvents` reads, so narrowing by place costs no extra request. */
const ALL_EVENTS: EventFilters = { sort: "soonest" };

/**
 * The city is alive, and GigSyc staffs it. Four events from the coming week — or four from
 * the customer's own city once they have told us where that is — then straight back to the
 * product. Renders nothing when there is nothing on; a failed load says so and offers a
 * retry, rather than looking like an empty city.
 */
export function WhatsHappening() {
  const { events, isPending, isError, isRefetching, refetch } = useUpcomingEvents(LIMIT);
  const { user, ready } = useAuth();
  const all = useEvents(ALL_EVENTS);
  const employers = useEmployers();

  // A signed-in customer who has finished onboarding told us where they live, so lead with it.
  // Wait for `ready` first: the session is read from localStorage after hydration, and without
  // the wait a signed-in customer gets the generic heading and four other cards for one commit.
  const place = ready && user?.role === "customer" && user.onboardingCompleted ? user.location : undefined;
  const nearby = useMemo(() => {
    if (!place || !all.data) return undefined;
    const here = all.data.filter((e) => e.place === place).slice(0, LIMIT);
    return here.length ? here : undefined;
  }, [all.data, place]);

  const shown = nearby ?? events;
  const near = nearby ? place : undefined;

  const organizerById = useMemo(
    () => new Map((employers.data ?? []).map((e) => [e.id, e.name])),
    [employers.data],
  );

  if (!isError && !isPending && !shown?.length) return null;

  return (
    <Section>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionIntro
          eyebrow="Events"
          title={near ? `What's happening near ${near}` : "What's happening"}
          lede={`Concerts, festivals, markets and race days ${near ? `around ${near}` : "across Rwanda"}, listed by the organisers who run them.`}
        />
        <Link
          href="/events"
          className="-my-2.5 inline-flex min-h-11 items-center gap-1.5 py-2.5 text-sm font-medium text-navy-700 underline-offset-4 hover:underline [&_svg]:size-4"
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
            {isPending || !shown
              ? Array.from({ length: LIMIT }, (_, i) => <li key={i}><EventCardSkeleton /></li>)
              : shown.map((event, i) => (
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
