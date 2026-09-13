"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarRange } from "lucide-react";
import { CategoryIcon, eventDateLabel } from "@/components/common";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { EVENT_CATEGORIES } from "@/data/events";
import { useStaggerOnce } from "@/lib/motion";
import { formatNumber } from "@/lib/utils";
import type { Event } from "@/types";

const fillPct = (event: Event) => (event.capacity ? Math.min(100, Math.round((event.attending / event.capacity) * 100)) : 0);
const fillTone = (pct: number) => (pct >= 90 ? "success" : pct >= 60 ? "navy" : "amber");

function Fill({ event }: { event: Event }) {
  const pct = fillPct(event);
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} tone={fillTone(pct)} className="w-16" label={`${event.title} is ${pct}% full`} />
      <span className="tabular text-xs text-fg-muted">{pct}%</span>
    </div>
  );
}

export function PopularEventsTable({ events }: { events: Event[] }) {
  const stagger = useStaggerOnce(events.length > 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Most popular events</CardTitle>
        <CardDescription>Published events with the most people registered</CardDescription>
      </CardHeader>

      {events.length === 0 ? (
        <EmptyState
          compact
          icon={CalendarRange}
          title="No published events yet"
          description="Approve something in the review queue and the busiest listings rank here."
        />
      ) : (
        <>
          <div className="mt-3 hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-fg-muted">
                  <th scope="col" className="px-5 py-3 font-medium">Event</th>
                  <th scope="col" className="px-5 py-3 font-medium">Place</th>
                  <th scope="col" className="px-5 py-3 font-medium">Date</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Attending</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Capacity</th>
                  <th scope="col" className="px-5 py-3 font-medium">Fill</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <motion.tr key={e.id} {...stagger(i)} className="border-b border-border last:border-0 hover:bg-ink-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <CategoryIcon category={e.category} size="sm" />
                        <div className="min-w-0">
                          <Link href={`/admin/events/${e.id}`} className="block truncate font-medium text-fg hover:text-navy-700 hover:underline">
                            {e.title}
                          </Link>
                          <p className="truncate text-xs text-fg-muted">{EVENT_CATEGORIES[e.category].label} · {e.venue}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-fg-muted">{e.place}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-fg-muted">{eventDateLabel(e)}</td>
                    <td className="px-5 py-3 text-right tabular font-medium text-fg">{formatNumber(e.attending)}</td>
                    <td className="px-5 py-3 text-right tabular text-fg-muted">{formatNumber(e.capacity)}</td>
                    <td className="px-5 py-3"><Fill event={e} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-3 divide-y divide-border lg:hidden">
            {events.map((e, i) => (
              <motion.li key={e.id} {...stagger(i)} className="flex items-start gap-3 p-4">
                <CategoryIcon category={e.category} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/events/${e.id}`} className="block truncate font-medium leading-5 text-fg hover:underline">
                    {e.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {e.place} · {eventDateLabel(e)} · {EVENT_CATEGORIES[e.category].label}
                  </p>
                  <p className="mt-1.5 text-xs text-fg-subtle">
                    <span className="tabular font-medium text-fg">{formatNumber(e.attending)}</span> of{" "}
                    <span className="tabular">{formatNumber(e.capacity)}</span> places taken
                  </p>
                  <div className="mt-2"><Fill event={e} /></div>
                </div>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
