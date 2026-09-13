import { CalendarDays, Clock, MapPin, Star } from "lucide-react";
import { eventDateLabel } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployerVerifiedMark } from "@/components/ui/verified";
import { EVENT_CATEGORIES } from "@/data/events";
import { formatTimeRange } from "@/lib/utils";
import type { Employer, Event } from "@/types";
import { eventHours, formatHours } from "./utils";

/**
 * Image-led opening. The title deliberately stays off the photo — overlaid headlines
 * become unreadable the moment a cover image is busy, and every event photo here is.
 */
export function EventHero({ event }: { event: Event }) {
  const category = EVENT_CATEGORIES[event.category];
  return (
    <div className="relative overflow-hidden rounded-lg">
      <Photo
        src={event.coverImage}
        alt={`${event.venue}, ${event.place}`}
        aspect="auto"
        rounded={false}
        priority
        className="aspect-video lg:aspect-[21/9]"
        sizes="(max-width: 1024px) 100vw, 1152px"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/70 to-transparent px-4 pb-4 pt-20 sm:px-5 sm:pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="solid">{category.label}</Badge>
          {event.featured ? <Badge tone="solid-amber"><Star className="fill-current" aria-hidden /> Featured</Badge> : null}
        </div>
      </div>
    </div>
  );
}

interface TitleBlockProps {
  event: Event;
  organizer?: Employer;
  organizerPending: boolean;
}

/** Title, hook, then the four facts a customer scans for before anything else. */
export function EventTitleBlock({ event, organizer, organizerPending }: TitleBlockProps) {
  const hours = formatHours(eventHours(event));
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold leading-tight sm:text-[32px]">{event.title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-fg-muted sm:text-base">{event.tagline}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-fg-muted">
        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
          <CalendarDays className="size-4" aria-hidden /> {eventDateLabel(event)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4 text-fg-subtle" aria-hidden /> {formatTimeRange(event.startTime, event.endTime)} · {hours}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4 text-fg-subtle" aria-hidden /> {event.venue}, {event.place}
        </span>
        {organizerPending ? (
          <Skeleton className="h-3.5 w-40" />
        ) : organizer ? (
          <span className="inline-flex items-center gap-2">
            <span>By <span className="font-medium text-fg">{organizer.name}</span></span>
            {organizer.verified ? <EmployerVerifiedMark /> : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}
