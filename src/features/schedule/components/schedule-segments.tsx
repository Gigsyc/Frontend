"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarDays, Compass, History, Hourglass } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import type { DateGroup, ScheduleItem } from "../types";
import { PastRow } from "./past-row";
import { PendingRow, UpcomingRow } from "./schedule-row";

const EASE = [0.22, 1, 0.36, 1] as const;
const enter = (i: number) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: Math.min(i, 8) * 0.03, ease: EASE },
});

/** Anchor id for a date group so the week strip can scroll to it. */
export const dayAnchor = (date: string) => `day-${date}`;

function DiscoverCta() {
  return (
    <Button asChild variant="secondary">
      <Link href="/worker"><Compass /> Discover shifts</Link>
    </Button>
  );
}

interface UpcomingProps {
  groups: DateGroup[];
  onWithdraw: (item: ScheduleItem) => void;
}

/** Confirmed shifts on future days, grouped by date. */
export function UpcomingList({ groups, onWithdraw }: UpcomingProps) {
  if (groups.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nothing confirmed yet"
        description="When an employer confirms you, the shift lands here with the venue, time and supervisor's number."
        action={<DiscoverCta />}
      />
    );
  }
  let index = 0;
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.date} id={dayAnchor(group.date)} aria-label={group.label} className="scroll-mt-20 space-y-2">
          <h3 className="px-1 text-[13px] font-semibold uppercase tracking-wide text-fg-muted">{group.label}</h3>
          <div className="divide-y divide-border rounded-lg bg-surface shadow-card">
            {group.items.map((item) => (
              <motion.div key={item.booking.id} {...enter(index++)}>
                <UpcomingRow item={item} onWithdraw={onWithdraw} />
              </motion.div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

interface PendingProps {
  items: ScheduleItem[];
  onWithdraw: (item: ScheduleItem) => void;
}

/** Applications waiting on an employer, plus invitations to answer. Invitations first. */
export function PendingList({ items, onWithdraw }: PendingProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Hourglass}
        title="No applications waiting"
        description="Apply to a shift and it sits here until the employer confirms. Invitations from employers show up here too."
        action={<DiscoverCta />}
      />
    );
  }
  const ordered = [...items].sort((a, b) => Number(b.booking.status === "invited") - Number(a.booking.status === "invited"));
  return (
    <div className="divide-y divide-border rounded-lg bg-surface shadow-card">
      {ordered.map((item, i) => (
        <motion.div key={item.booking.id} id={dayAnchor(item.shift.date)} className="scroll-mt-20" {...enter(i)}>
          <PendingRow item={item} onWithdraw={onWithdraw} />
        </motion.div>
      ))}
    </div>
  );
}

interface PastProps {
  items: ScheduleItem[];
  onRate: (item: ScheduleItem) => void;
}

/** History: completed, no-shows, cancellations and declined invitations, newest first. */
export function PastList({ items, onRate }: PastProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No shifts worked yet"
        description="Your first completed shift shows up here with the rating you received. Ratings build your reputation on GigSyc."
        action={<DiscoverCta />}
      />
    );
  }
  return (
    <div className="divide-y divide-border rounded-lg bg-surface shadow-card">
      {items.map((item, i) => (
        <motion.div key={item.booking.id} {...enter(i)}>
          <PastRow item={item} onRate={onRate} />
        </motion.div>
      ))}
    </div>
  );
}
