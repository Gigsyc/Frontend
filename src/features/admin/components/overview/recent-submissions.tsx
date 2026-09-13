"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Inbox } from "lucide-react";
import { EmptyState, EventStatusBadge } from "@/components/ui";
import { EVENT_CATEGORIES } from "@/data/events";
import { formatTimeAgo } from "@/lib/utils";
import type { Event } from "@/types";
import { useStaggerOnce } from "@/lib/motion";
import { EventThumb } from "../events/event-thumb";
import { Panel, PanelLink } from "./panel";

interface Props {
  events: Event[];
  organizerName: (id: string) => string;
}

/** The five newest submissions, in the order an organiser sent them. */
export function RecentSubmissions({ events, organizerName }: Props) {
  const stagger = useStaggerOnce(events.length > 0);

  return (
    <Panel title="Recent submissions" action={<PanelLink href="/admin/events?status=pending_review">Review queue</PanelLink>}>
      {events.length === 0 ? (
        <EmptyState
          compact
          icon={Inbox}
          title="Nothing submitted yet"
          description="Events land here the moment an organiser sends one in for review."
        />
      ) : (
        <ul className="divide-y divide-border">
          {events.map((e, i) => (
            <motion.li key={e.id} {...stagger(i)}>
              <Link href={`/admin/events/${e.id}`} className="group flex min-h-11 items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-50">
                <EventThumb src={e.coverImage} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-fg group-hover:text-navy-800">{e.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-fg-muted">
                    {organizerName(e.organizerId)} · {EVENT_CATEGORIES[e.category].label}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <EventStatusBadge status={e.status} />
                  {e.submittedAt ? <span className="text-xs text-fg-subtle">{formatTimeAgo(e.submittedAt)}</span> : null}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
