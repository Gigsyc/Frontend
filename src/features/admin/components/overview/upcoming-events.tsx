"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarRange } from "lucide-react";
import { eventDateLabel } from "@/components/common";
import { EmptyState } from "@/components/ui";
import type { Event } from "@/types";
import { useStaggerOnce } from "@/lib/motion";
import { Panel, PanelLink } from "./panel";

/** What the public site is counting down to — the next five published events. */
export function UpcomingEvents({ events }: { events: Event[] }) {
  const stagger = useStaggerOnce(events.length > 0);

  return (
    <Panel title="Upcoming events" action={<PanelLink href="/admin/events?status=published">All published</PanelLink>}>
      {events.length === 0 ? (
        <EmptyState
          compact
          icon={CalendarRange}
          title="Nothing published ahead"
          description="Approve a submission and it will appear here and on /events."
        />
      ) : (
        <ul className="divide-y divide-border">
          {events.map((e, i) => (
            <motion.li key={e.id} {...stagger(i)}>
              <Link href={`/admin/events/${e.id}`} className="group flex min-h-11 items-start gap-4 px-5 py-3 transition-colors hover:bg-ink-50">
                <span className="w-[88px] shrink-0">
                  <span className="block text-[13px] font-medium leading-5 text-fg">{eventDateLabel(e)}</span>
                  <span className="block text-xs leading-4 text-fg-muted tabular">{e.startTime}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-fg group-hover:text-navy-800">{e.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-fg-muted">{e.venue}, {e.place}</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
