"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarPlus } from "lucide-react";
import { eventDateLabel } from "@/components/common/event-card";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Photo } from "@/components/ui/photo";
import { EventStatusBadge } from "@/components/ui/status-badge";
import { useStaggerOnce } from "@/lib/motion";
import type { Event } from "@/types";
import { partnerEventStatus } from "../event-vocabulary";

/** The next few events as rows — a cover thumbnail, when, and where it stands with GigSyc. */
export function YourEvents({ events }: { events: Event[] }) {
  const stagger = useStaggerOnce(events.length > 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Your events</CardTitle>
          <CardDescription>{events.length ? "What's coming up and where each one stands" : "Nothing listed yet"}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild><Link href="/employer/events">See all</Link></Button>
      </CardHeader>
      {events.length === 0 ? (
        <EmptyState
          compact
          icon={CalendarPlus}
          title="No events yet"
          description="List your first event and it shows up here — GigSyc reviews it before guests can see it."
          action={<Button size="sm" variant="accent" asChild><Link href="/employer/events/new">Submit an event</Link></Button>}
        />
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {events.map((e, i) => (
            <motion.li key={e.id} {...stagger(i)}>
              <Link href={`/employer/events/${e.id}`} className="group flex items-center gap-3.5 px-5 py-3 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:bg-ink-50">
                <Photo src={e.coverImage} alt="" aspect="square" rounded={false} blur={false} className="size-10 shrink-0 rounded-md" sizes="40px" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-fg group-hover:text-navy-800">{e.title}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px]">
                    <span className="font-medium text-amber-700">{eventDateLabel(e)}</span>
                    <span className="text-fg-muted">· {e.startTime} · {e.venue}</span>
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <EventStatusBadge status={e.status} />
                  <span className="hidden text-xs text-fg-subtle md:block">{partnerEventStatus(e.status)}</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
}
