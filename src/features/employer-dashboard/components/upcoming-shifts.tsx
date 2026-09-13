"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { format, parseISO } from "date-fns";
import { CalendarPlus, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FillMeter } from "@/components/ui/progress";
import { ShiftStatusBadge } from "@/components/ui/status-badge";
import { formatTimeRange } from "@/lib/utils";
import type { UpcomingShift } from "../use-dashboard";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function UpcomingShifts({ items, total }: { items: UpcomingShift[]; total: number }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Upcoming shifts</CardTitle>
          <CardDescription>{total ? `Next ${items.length} of ${total} · fill status at a glance` : "Nothing scheduled yet"}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild><Link href="/employer/jobs">All jobs</Link></Button>
      </CardHeader>
      {items.length === 0 ? (
        <EmptyState
          compact
          icon={CalendarPlus}
          title="No upcoming shifts"
          description="Post a shift and verified workers in Kigali can apply within minutes."
          action={<Button size="sm" asChild><Link href="/employer/jobs/new">Post a shift</Link></Button>}
        />
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {items.map(({ shift, confirmed }, i) => {
            const date = parseISO(shift.date);
            return (
              <motion.li key={shift.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE, delay: Math.min(i, 7) * 0.03 }}>
                <Link href={`/employer/jobs/${shift.id}`} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:bg-ink-50">
                  <time dateTime={shift.date} className="flex w-11 shrink-0 flex-col items-center rounded-md bg-navy-50 py-1.5 text-navy-900">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">{format(date, "EEE")}</span>
                    <span className="font-display text-lg font-semibold leading-none tabular">{format(date, "d")}</span>
                  </time>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-fg group-hover:text-navy-800">{shift.title}</span>
                      {shift.urgent ? <Badge tone="solid-amber"><Zap className="fill-current" /> Urgent</Badge> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-fg-muted">{shift.venue} · {formatTimeRange(shift.startTime, shift.endTime)}</span>
                    <FillMeter filled={confirmed} needed={shift.workersNeeded} className="mt-2 sm:hidden" />
                  </span>
                  <FillMeter filled={confirmed} needed={shift.workersNeeded} className="hidden w-36 shrink-0 sm:flex" />
                  <ShiftStatusBadge status={shift.status} className="hidden shrink-0 md:inline-flex" />
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
