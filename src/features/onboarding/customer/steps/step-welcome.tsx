"use client";

import { OnboardingHeading } from "@/components/layout/onboarding-shell";
import { Photo } from "@/components/ui/photo";
import { Skeleton } from "@/components/ui/skeleton";
import { pluralize } from "@/lib/utils";
import type { EventsSummary } from "../state";
import { EventsRetry } from "./events-retry";

const COVERS = 4;

/**
 * The greeting. The thumbnail strip is decoration drawn from real published events, so it simply
 * stays away when there is nothing to show — but a failed query is offered the same retry the
 * next step has, because that step needs the counts this one is only decorating with.
 */
export function StepWelcome({ firstName, events }: { firstName: string; events: EventsSummary }) {
  const list = events.list ?? [];
  const covers = list.slice(0, COVERS);

  return (
    <div>
      <OnboardingHeading
        title={`Welcome to GigSyc, ${firstName}.`}
        description="Let's personalise what you discover. This takes about thirty seconds."
      />

      {events.pending ? (
        <div className="grid grid-cols-4 gap-3" aria-hidden>
          {Array.from({ length: COVERS }, (_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : covers.length > 0 ? (
        <>
          <ul className="grid grid-cols-4 gap-3">
            {covers.map((event) => (
              <li key={event.id}>
                <Photo src={event.coverImage} alt="" aspect="square" sizes="(max-width: 640px) 22vw, 128px" />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-fg-muted">
            {pluralize(list.length, "event")} coming up around Rwanda.
          </p>
        </>
      ) : events.error ? (
        <EventsRetry message="We couldn't load what's coming up." onRetry={events.retry} />
      ) : null}
    </div>
  );
}
