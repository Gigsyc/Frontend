"use client";

import { ExternalLink, Users } from "lucide-react";
import { eventDateLabel, eventPriceLabel } from "@/components/common/event-card";
import { Card, DataList, Progress } from "@/components/ui";
import { EVENT_CATEGORIES } from "@/data/events";
import { formatDate, formatTimeAgo, formatTimeRange, pluralize } from "@/lib/utils";
import type { Event } from "@/types";
import { fillPercent, publicHref, spotsLeft } from "../list/organizer-helpers";

/** Who's coming, the facts guests see, and how the listing has moved. */
export function OrganizerEventSidebar({ event }: { event: Event }) {
  const pct = Math.round(fillPercent(event));
  const live = event.status === "published";

  const facts: Array<{ label: string; value: React.ReactNode }> = [
    { label: "When", value: <span className="tabular">{eventDateLabel(event)} · {formatTimeRange(event.startTime, event.endTime)}</span> },
    { label: "Where", value: <>{event.venue}<span className="block text-xs text-fg-muted">{event.address}, {event.place}</span></> },
    { label: "Doors", value: event.doorsOpen ?? "At the start time" },
    { label: "Category", value: EVENT_CATEGORIES[event.category].label },
    { label: "Price", value: <span className="tabular">{eventPriceLabel(event)}</span> },
  ];
  if (event.ageRestriction) facts.push({ label: "Age restriction", value: event.ageRestriction });
  if (live) {
    facts.push({
      label: "Public page",
      value: (
        <a href={publicHref(event.slug)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy-700 hover:underline">
          gigsyc.rw{publicHref(event.slug)} <ExternalLink className="size-3.5" aria-hidden />
        </a>
      ),
    });
  }

  const timeline = [
    { label: "Created", at: event.createdAt },
    event.submittedAt ? { label: "Submitted to GigSyc", at: event.submittedAt } : null,
    event.reviewedAt ? { label: event.status === "rejected" ? "GigSyc asked for changes" : "Reviewed by GigSyc", at: event.reviewedAt } : null,
  ].filter((t): t is { label: string; at: string } => t !== null).sort((a, b) => a.at.localeCompare(b.at));

  return (
    <div className="space-y-6">
      <Card className="p-5" aria-labelledby="guests-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="guests-heading" className="text-[13px] font-medium text-fg-muted">Guests</h2>
          <Users className="size-4 text-fg-subtle" aria-hidden />
        </div>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-[28px] font-semibold leading-none tracking-tight text-navy-900 tabular">{event.attending.toLocaleString("en-US")}</span>
          <span className="text-sm text-fg-muted">going · of {event.capacity.toLocaleString("en-US")}</span>
        </p>
        <Progress value={pct} tone={pct >= 100 ? "success" : live ? "amber" : "navy"} size="md" className="mt-4" label={`${event.attending} of ${event.capacity} spots taken`} />
        <p className="mt-2 flex justify-between text-xs text-fg-muted tabular">
          <span>{pct}% full</span>
          <span>{pluralize(spotsLeft(event), "spot")} left</span>
        </p>
        {!live && event.attending === 0 ? <p className="mt-3 text-xs text-fg-muted">Guests can start joining once the event is live on GigSyc.</p> : null}
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Details</h2>
        <DataList items={facts} className="mt-4" />
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Timeline</h2>
        <ol className="mt-4 space-y-3">
          {timeline.map((t) => (
            <li key={t.label} className="relative flex items-start gap-3 text-sm">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-navy-300" aria-hidden />
              <div className="min-w-0">
                <p className="font-medium text-fg">{t.label}</p>
                <p className="text-xs text-fg-muted"><time dateTime={t.at}>{formatDate(t.at)}</time> · {formatTimeAgo(t.at)}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
