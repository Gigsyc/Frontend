"use client";

import Link from "next/link";
import { CalendarDays, ChevronLeft, Clock, MapPin } from "lucide-react";
import { eventDateLabel } from "@/components/common/event-card";
import { Badge, EventStatusBadge, PageHeader, Photo } from "@/components/ui";
import { EVENT_CATEGORIES } from "@/data/events";
import { formatTimeRange } from "@/lib/utils";
import type { Event } from "@/types";
import { PARTNER_STATUS_LABEL } from "../list/organizer-helpers";
import { OrganizerEventActions } from "./organizer-event-actions";

interface OrganizerEventHeaderProps {
  event: Event;
  onSubmit: () => void;
  onCancel: () => void;
}

/** Photo first — this is the promoter's desk. Then the title, the partner's reading of the status, and the facts. */
export function OrganizerEventHeader({ event, onSubmit, onCancel }: OrganizerEventHeaderProps) {
  return (
    <div className="space-y-5">
      <Link href="/employer/events" className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-fg-muted transition-colors hover:text-fg sm:min-h-0 [&_svg]:size-4">
        <ChevronLeft aria-hidden /> Your events
      </Link>

      <div className="relative">
        <Photo src={event.coverImage} alt={`Cover photo for ${event.title}`} aspect="wide" priority sizes="(max-width: 1024px) 100vw, 1100px" />
        <div className="absolute left-4 top-4">
          <Badge tone="solid" className="backdrop-blur-sm">{EVENT_CATEGORIES[event.category].label}</Badge>
        </div>
      </div>

      <PageHeader
        title={event.title}
        description={event.tagline}
        actions={<OrganizerEventActions event={event} onSubmit={onSubmit} onCancel={onCancel} />}
      >
        <div className="flex flex-col gap-2 text-sm text-fg-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
          <span className="inline-flex items-center gap-2">
            <EventStatusBadge status={event.status} />
            <span>{PARTNER_STATUS_LABEL[event.status]}</span>
          </span>
          <span className="hidden text-fg-subtle sm:inline" aria-hidden>·</span>
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-700"><CalendarDays className="size-4" aria-hidden />{eventDateLabel(event)}</span>
            <span className="inline-flex items-center gap-1.5 tabular"><Clock className="size-4 text-fg-subtle" aria-hidden />{formatTimeRange(event.startTime, event.endTime)}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-fg-subtle" aria-hidden />{event.venue}, {event.place}</span>
          </span>
        </div>
      </PageHeader>
    </div>
  );
}
