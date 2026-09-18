"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { eventDateLabel, eventPriceLabel } from "@/components/common/event-card";
import { EventStatusBadge, Photo, Progress, Skeleton } from "@/components/ui";
import { useStaggerOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";
import { detailHref, fillPercent, PARTNER_STATUS_LABEL } from "./organizer-helpers";
import { OrganizerEventMenu } from "./organizer-event-menu";
import { ReviewNote } from "./review-note";

interface OrganizerEventsTableProps {
  events: Event[];
  onSubmit: (event: Event) => void;
  onCancel: (event: Event) => void;
}

const HEAD = ["Event", "Date", "Status", "Going", "Price", ""];

function Going({ event, className }: { event: Event; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Progress value={fillPercent(event)} tone={event.status === "published" ? "amber" : "navy"} className="w-16" label={`${event.attending} of ${event.capacity} spots taken`} />
      <span className="text-xs text-fg tabular">{event.attending.toLocaleString("en-US")}<span className="text-fg-muted">/{event.capacity.toLocaleString("en-US")}</span></span>
    </div>
  );
}

function Thumb({ event }: { event: Event }) {
  return <Photo src={event.coverImage} alt="" aspect="square" rounded={false} blur={false} sizes="40px" className="size-10 shrink-0 rounded-md" />;
}

/** Desktop table + stacked cards under md. Row click opens the event; actions live in the ⋯ menu. */
export function OrganizerEventsTable({ events, onSubmit, onCancel }: OrganizerEventsTableProps) {
  const router = useRouter();
  const stagger = useStaggerOnce(true);
  const go = (id: string) => router.push(detailHref(id));

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-fg-muted">
              {HEAD.map((h, i) => <th key={i} scope="col" className={cn("px-5 py-3 font-medium", i === 4 && "text-right")}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <motion.tr key={e.id} {...stagger(i)} onClick={() => go(e.id)} className="group cursor-pointer border-b border-border last:border-0 hover:bg-ink-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Thumb event={e} />
                    <div className="min-w-0 max-w-xs">
                      <Link href={detailHref(e.id)} className="block truncate font-medium text-fg group-hover:text-navy-800" onClick={(ev) => ev.stopPropagation()}>{e.title}</Link>
                      <p className="truncate text-xs text-fg-muted">{e.venue}, {e.place}</p>
                      {e.status === "rejected" && e.reviewNote ? <ReviewNote note={e.reviewNote} className="mt-1.5" /> : null}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <p className="font-medium text-amber-700">{eventDateLabel(e)}</p>
                  <p className="text-xs text-fg-muted tabular">{e.startTime}</p>
                </td>
                <td className="px-5 py-3.5">
                  <EventStatusBadge status={e.status} />
                  <p className="mt-1 text-xs text-fg-muted">{PARTNER_STATUS_LABEL[e.status]}</p>
                </td>
                <td className="px-5 py-3.5"><Going event={e} /></td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right font-display font-semibold text-navy-900 tabular">{eventPriceLabel(e)}</td>
                <td className="px-3 py-3.5 text-right"><OrganizerEventMenu event={e} onSubmit={onSubmit} onCancel={onCancel} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {events.map((e, i) => (
          <motion.li key={e.id} {...stagger(i)} className="relative">
            <Link href={detailHref(e.id)} className="flex min-h-11 flex-col gap-3 p-4 pr-14 active:bg-ink-50">
              <div className="flex items-start gap-3">
                <Thumb event={e} />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-medium leading-5 text-fg">{e.title}</p>
                  <p className="mt-0.5 truncate text-xs text-fg-muted">{e.venue}, {e.place}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
                <span className="font-medium text-amber-700">{eventDateLabel(e)}</span>
                <span className="tabular">{e.startTime}</span>
                <span className="font-display font-semibold text-navy-900 tabular">{eventPriceLabel(e)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <EventStatusBadge status={e.status} />
                <span className="text-xs text-fg-muted">{PARTNER_STATUS_LABEL[e.status]}</span>
              </div>
              <Going event={e} />
              {e.status === "rejected" && e.reviewNote ? <ReviewNote note={e.reviewNote} /> : null}
            </Link>
            <div className="absolute right-2 top-2">
              <OrganizerEventMenu event={e} onSubmit={onSubmit} onCancel={onCancel} triggerClassName="size-11 md:size-8" />
            </div>
          </motion.li>
        ))}
      </ul>
    </>
  );
}

export function OrganizerEventsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden className="divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex-1"><Skeleton className="h-4 w-2/3 max-w-72" /><Skeleton className="mt-2 h-3 w-1/3 max-w-40" /></div>
          <Skeleton className="hidden h-4 w-24 md:block" />
          <Skeleton className="hidden h-5 w-20 rounded-sm md:block" />
          <Skeleton className="hidden h-2 w-16 md:block" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
