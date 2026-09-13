"use client";

import { EventCard } from "@/components/common/event-card";
import { SectionHeading } from "@/components/ui/page-header";
import type { Event } from "@/types";

interface FeaturedRailProps {
  events: Event[];
  organizerName: (event: Event) => string | undefined;
  isSaved: (event: Event) => boolean;
  onToggleSave: (event: Event) => void;
}

/** One hero event with two companions beside it on large screens. Silent when nothing is featured. */
export function FeaturedRail({ events, organizerName, isSaved, onToggleSave }: FeaturedRailProps) {
  if (events.length === 0) return null;
  const [hero, ...rest] = events;
  const companions = rest.slice(0, 2);

  return (
    <section aria-labelledby="featured-heading" className="space-y-4">
      <SectionHeading title={<span id="featured-heading">Featured this month</span>} description="Picked by the GigSyc events team." />
      <div className="grid gap-4 lg:grid-cols-3">
        <EventCard
          event={hero}
          emphasis="hero"
          priority
          className="h-full lg:col-span-2"
          organizerName={organizerName(hero)}
          saved={isSaved(hero)}
          onToggleSave={() => onToggleSave(hero)}
        />
        {companions.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {companions.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                className="h-full"
                organizerName={organizerName(event)}
                saved={isSaved(event)}
                onToggleSave={() => onToggleSave(event)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
