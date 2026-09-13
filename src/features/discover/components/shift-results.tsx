"use client";

import Link from "next/link";
import { BellRing, Compass, SearchX } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ShiftCard, ShiftCardSkeleton } from "@/components/common/shift-card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { BookingStatusBadge } from "@/components/ui/status-badge";
import { cn, pluralize } from "@/lib/utils";
import type { BookingStatus, Employer, RoleCategory, Shift } from "@/types";
import { skillsSentence } from "../utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ShiftResultsProps {
  shifts: Shift[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  isRefetching: boolean;
  /** True while showing the previous list as placeholder for a new filter set. */
  isStale: boolean;
  refetch: () => void;
  employerById: Map<string, Employer>;
  bookingByShift: Map<string, BookingStatus>;
  sortLabel: string;
  hasFilters: boolean;
  skills: RoleCategory[];
  onClear: () => void;
}

export function ShiftResults(props: ShiftResultsProps) {
  const { shifts, isPending, isError, error, isRefetching, isStale, refetch, employerById, bookingByShift, sortLabel, hasFilters, skills, onClear } = props;

  // Stagger only the very first list that lands; filter changes should feel instant.
  // Flipped from the first item's animation callback so no ref or effect is read during render.
  const [stagger, setStagger] = useState(true);

  if (isPending) {
    return (
      <section aria-busy="true" aria-label="Loading shifts" className="space-y-3">
        <div className="h-4 w-40 skeleton" aria-hidden />
        <ul className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <li key={i}><ShiftCardSkeleton /></li>)}</ul>
      </section>
    );
  }

  if (isError || !shifts) {
    return <ErrorState title="We couldn't load shifts" error={error} onRetry={refetch} retrying={isRefetching} className="rounded-lg bg-surface shadow-card" />;
  }

  if (shifts.length === 0) {
    return hasFilters ? (
      <EmptyState
        icon={SearchX}
        title="No shifts match"
        description="Try a wider date range or drop a filter — new shifts land every day."
        action={<Button variant="outline" onClick={onClear}>Clear filters</Button>}
        className="rounded-lg bg-surface shadow-card"
      />
    ) : (
      <EmptyState
        icon={Compass}
        title="Nothing open right now"
        description={<>New shifts are posted every day. Turn on notifications for {skillsSentence(skills)} and we&apos;ll tell you the moment one lands.</>}
        action={<Button asChild><Link href="/worker/profile/settings"><BellRing /> Notification settings</Link></Button>}
        className="rounded-lg bg-surface shadow-card"
      />
    );
  }

  return (
    <section aria-label="Open shifts" className="space-y-3">
      <p role="status" className="text-[13px] text-fg-muted">
        <span className="font-medium text-fg tabular">{pluralize(shifts.length, "shift")}</span> · {sortLabel}
      </p>
      <ul className={cn("grid gap-4 transition-opacity duration-200 sm:grid-cols-2", isStale && "opacity-60")}>
        {shifts.map((shift, i) => {
          const status = bookingByShift.get(shift.id);
          return (
            <motion.li
              key={shift.id}
              initial={stagger ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE, delay: stagger ? Math.min(i, 8) * 0.03 : 0 }}
              onAnimationComplete={() => setStagger(false)}
              className="flex"
            >
              <ShiftCard
                shift={shift}
                employer={employerById.get(shift.employerId)}
                href={`/worker/shifts/${shift.id}`}
                badge={status ? <BookingStatusBadge status={status} /> : undefined}
                className="w-full"
              />
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
