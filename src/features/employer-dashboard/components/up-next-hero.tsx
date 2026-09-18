"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CalendarPlus, Clock, ExternalLink, MapPin, Users } from "lucide-react";
import { eventDateLabel, eventPriceLabel } from "@/components/common/event-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Progress } from "@/components/ui/progress";
import { EventStatusBadge } from "@/components/ui/status-badge";
import { EVENT_CATEGORIES } from "@/data/events";
import { IMAGES } from "@/data/images";
import { formatNumber, formatTimeAgo } from "@/lib/utils";
import type { Event } from "@/types";
import { partnerEventStatus } from "../event-vocabulary";

interface Props {
  event: Event | undefined;
  /** False when the partner has never listed anything — the invitation explains review. */
  hasAnyEvent: boolean;
}

/**
 * The biggest thing on the desk: the next event and who is coming. When there is nothing
 * ahead, the same slot becomes the invitation to list one, so the page never opens on a gap.
 */
export function UpNextHero({ event, hasAnyEvent }: Props) {
  if (!event) return <ListInvitation firstTime={!hasAnyEvent} />;

  const live = event.status === "published";
  const pct = event.capacity ? (event.attending / event.capacity) * 100 : 0;
  const category = EVENT_CATEGORIES[event.category];

  return (
    <section aria-labelledby="up-next" className="overflow-hidden rounded-lg bg-surface shadow-card">
      <div className="relative">
        <Photo
          src={event.coverImage}
          alt=""
          aspect="wide"
          rounded={false}
          priority
          className="aspect-video sm:aspect-[21/9]"
          sizes="(max-width: 1280px) 100vw, 1100px"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-950/70 to-transparent" aria-hidden />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-1.5 sm:left-5 sm:top-5">
          <Badge tone="solid" className="backdrop-blur-sm">{category.label}</Badge>
          <EventStatusBadge status={event.status} />
        </div>
        <p id="up-next" className="absolute bottom-4 left-4 text-[13px] font-semibold uppercase tracking-wider text-amber-400 sm:bottom-5 sm:left-5">
          Up next
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-semibold leading-tight text-navy-900 sm:text-[28px]">{event.title}</h2>
          <p className="mt-1.5 text-sm text-fg-muted">{event.tagline}</p>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700"><CalendarDays className="size-4" aria-hidden />{eventDateLabel(event)}</span>
            <span className="inline-flex items-center gap-1.5 text-fg-muted"><Clock className="size-4" aria-hidden />{event.startTime} – {event.endTime}</span>
            <span className="inline-flex min-w-0 items-center gap-1.5 text-fg-muted"><MapPin className="size-4 shrink-0" aria-hidden /><span className="truncate">{event.venue}, {event.place}</span></span>
          </p>
        </div>

        <div className="flex flex-col justify-between gap-5">
          {live ? (
            <div>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium text-fg">
                  <Users className="size-4 text-fg-subtle" aria-hidden />
                  <span className="tabular">{formatNumber(event.attending)}</span> of <span className="tabular">{formatNumber(event.capacity)}</span> guests
                </span>
                <span className="text-xs text-fg-muted tabular">{Math.round(pct)}%</span>
              </div>
              <Progress value={pct} tone={pct >= 90 ? "success" : "navy"} size="md" className="mt-2" label={`${event.attending} of ${event.capacity} guests`} />
              <p className="mt-2 text-xs text-fg-muted">{eventPriceLabel(event)} · {partnerEventStatus(event.status)}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-fg">{partnerEventStatus(event.status)}</p>
              <p className="mt-1 text-[13px] text-fg-muted">
                {event.submittedAt ? `Submitted ${formatTimeAgo(event.submittedAt)}. ` : ""}Your guest list opens the moment it goes live.
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/employer/events/${event.id}`}>Open event <ArrowRight /></Link>
            </Button>
            {live ? (
              <Button variant="outline" asChild>
                <Link href={`/events/${event.slug}`} target="_blank" rel="noreferrer">View on GigSyc <ExternalLink /></Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ListInvitation({ firstTime }: { firstTime: boolean }) {
  return (
    <section aria-labelledby="up-next" className="grid overflow-hidden rounded-lg bg-surface shadow-card lg:grid-cols-[1fr_1.2fr]">
      <Photo src={IMAGES.eventLights} alt="" aspect="video" rounded={false} className="lg:aspect-auto lg:h-full lg:min-h-64" sizes="(max-width: 1024px) 100vw, 480px" />
      <div className="flex flex-col justify-center gap-4 p-5 sm:p-6 lg:p-8">
        <p id="up-next" className="text-[13px] font-semibold uppercase tracking-wider text-amber-700">Up next</p>
        <div>
          <h2 className="font-display text-2xl font-semibold leading-tight text-navy-900 sm:text-[28px]">
            {firstTime ? "Your first event starts here" : "Nothing on the calendar yet"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-fg-muted">
            {firstTime
              ? "List an event and GigSyc reviews it before it goes live — usually within two working days — so every event guests see has been checked."
              : "Your last event is done. List the next one and it appears here, with the guest count, as soon as GigSyc publishes it."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="accent" asChild>
            <Link href="/employer/events/new"><CalendarPlus /> List your next event</Link>
          </Button>
          {firstTime ? null : (
            <Button variant="ghost" asChild><Link href="/employer/events">See past events</Link></Button>
          )}
        </div>
      </div>
    </section>
  );
}
