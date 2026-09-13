"use client";

import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { SectionHeading } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { pluralize } from "@/lib/utils";
import type { Destination, Event, RwandaPlace } from "@/types";

interface BrowseByPlaceProps {
  destinations: Destination[] | undefined;
  events: Event[] | undefined;
}

/** Places that actually have something on, busiest first. Picking one filters the board by place. */
export function BrowseByPlace({ destinations, events }: BrowseByPlaceProps) {
  if (!destinations || !events) {
    return (
      <section className="space-y-4" aria-busy="true" aria-label="Loading places">
        <div className="h-5 w-36 skeleton" aria-hidden />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-44 rounded-lg" />)}
        </div>
      </section>
    );
  }

  const counts = new Map<RwandaPlace, number>();
  for (const event of events) counts.set(event.place, (counts.get(event.place) ?? 0) + 1);

  const withEvents = destinations
    .map((destination) => ({ destination, count: counts.get(destination.name) ?? 0 }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  if (withEvents.length === 0) return null;

  return (
    <section aria-labelledby="places-heading" className="space-y-4">
      <SectionHeading
        title={<span id="places-heading">Browse by place</span>}
        description="Eight places we run events in, from the capital to the parks."
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {withEvents.map(({ destination, count }) => (
          <li key={destination.id} className="flex">
            <Link
              href={`/events?place=${encodeURIComponent(destination.name)}`}
              className="group w-full overflow-hidden rounded-lg bg-surface text-left shadow-card transition-[box-shadow,transform] duration-200 ease-out-soft hover:-translate-y-px hover:shadow-raised focus-visible:outline-none focus-visible:shadow-focus"
            >
              <Photo
                src={destination.heroImage}
                alt=""
                aspect="video"
                rounded={false}
                sizes="(max-width: 640px) 50vw, 25vw"
                className="transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
              />
              <span className="block p-3">
                <span className="block text-[15px] font-semibold text-fg group-hover:text-navy-800">{destination.name}</span>
                <span className="mt-0.5 line-clamp-1 block text-[13px] text-fg-muted">{destination.tagline}</span>
                <span className="mt-1.5 block text-xs tabular text-fg-subtle">{pluralize(count, "event")}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
