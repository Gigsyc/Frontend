"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { eventDateLabel } from "@/components/common";
import { Card, DataList, EventStatusBadge } from "@/components/ui";
import { EVENT_CATEGORIES, EVENT_STATUS_LABEL } from "@/data/events";
import { cn, formatDate, formatTimeAgo, formatTimeRange, pluralize } from "@/lib/utils";
import type { AttendanceMode, Employer, Event } from "@/types";
import { FeaturedToggle } from "./event-featured-toggle";

const MODE_LABEL: Record<AttendanceMode, string> = {
  tickets: "Ticketed",
  register: "Register in advance",
  free: "Free entry",
};

const stamp = (iso: string) => `${formatDate(iso)} · ${formatTimeAgo(iso)}`;

function OrganizerValue({ organizer }: { organizer: Employer }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="font-medium text-fg">{organizer.name}</span>
      <span className={cn("inline-flex items-center gap-1 text-xs", organizer.verified ? "text-cyan-700" : "text-warning-700")}>
        {organizer.verified ? <ShieldCheck className="size-3.5" aria-hidden /> : <ShieldAlert className="size-3.5" aria-hidden />}
        {organizer.verified ? "Verified partner" : "Not verified yet"}
      </span>
    </span>
  );
}

interface Props {
  event: Event;
  organizer?: Employer;
  onToggleFeatured: () => void;
  featuredBusy: boolean;
}

/** Everything about the record rather than the event: who sent it, when, and where it points. */
export function EventMetaCard({ event, organizer, onToggleFeatured, featuredBusy }: Props) {
  const published = event.status === "published";

  const items: Array<{ label: string; value: ReactNode }> = [
    { label: "Status", value: <EventStatusBadge status={event.status} /> },
    { label: "Submitted", value: event.submittedAt ? stamp(event.submittedAt) : "Never submitted for review" },
    { label: "Reviewed", value: event.reviewedAt ? stamp(event.reviewedAt) : "Not reviewed yet" },
    { label: "Organiser", value: organizer ? <OrganizerValue organizer={organizer} /> : "Unknown organiser" },
    { label: "Category", value: EVENT_CATEGORIES[event.category].label },
    { label: "Place", value: event.place },
    { label: "Venue", value: event.venue },
    { label: "Address", value: event.address },
    { label: "Date", value: eventDateLabel(event) },
    {
      label: "Time",
      value: (
        <span className="tabular">
          {formatTimeRange(event.startTime, event.endTime)}
          {event.doorsOpen ? <span className="text-fg-muted"> · doors {event.doorsOpen}</span> : null}
        </span>
      ),
    },
    { label: "Attendance", value: MODE_LABEL[event.attendanceMode] },
  ];

  if (event.staffedShiftIds.length > 0) {
    items.push({ label: "GigSyc staffing", value: `${pluralize(event.staffedShiftIds.length, "shift")} booked through GigSyc` });
  }

  items.push({
    label: "Public URL",
    value: published ? (
      <Link href={`/events/${event.slug}`} className="break-all font-medium text-navy-700 hover:text-navy-900 hover:underline">
        /events/{event.slug}
      </Link>
    ) : (
      <span className="text-fg-muted">Not on the public site while it is {EVENT_STATUS_LABEL[event.status].toLowerCase()}</span>
    ),
  });

  return (
    <Card className="space-y-5 p-5">
      <h2 className="text-base font-semibold">Record</h2>
      <DataList items={items} />

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="flex flex-col">
          <span className="text-sm font-medium text-fg">Featured</span>
          <span className="text-xs text-fg-muted">Leads the line-up on /events.</span>
        </span>
        <FeaturedToggle event={event} onToggle={onToggleFeatured} busy={featuredBusy} className="size-11 sm:size-8" />
      </div>

      {published ? (
        <Link
          href={`/events/${event.slug}`}
          className="flex min-h-11 items-center justify-between gap-2 rounded-md bg-navy-50 px-3 text-sm font-medium text-navy-900 transition-colors hover:bg-navy-100"
        >
          What the customer sees
          <ExternalLink className="size-4" aria-hidden />
        </Link>
      ) : null}
    </Card>
  );
}
