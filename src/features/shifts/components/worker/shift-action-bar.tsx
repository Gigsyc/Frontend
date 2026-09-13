"use client";

import Link from "next/link";
import { CalendarCheck, Check, Clock } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplyDialog, InviteActions, WithdrawDialog } from "@/features/bookings/components/worker";
import { formatRelativeDay, formatRwf, shiftHours } from "@/lib/utils";
import type { Booking, Shift } from "@/types";

interface ShiftActionBarProps {
  shift: Shift;
  /** Undefined until the employer loads — name-dependent copy is held back rather than filled with a placeholder. */
  employerName?: string;
  workerId: string;
  booking?: Booking;
  bookingPending: boolean;
}

const CLOSED_COPY: Record<Exclude<Shift["status"], "open">, string> = {
  filled: "This shift is full — see similar shifts below.",
  in_progress: "This shift is already underway.",
  completed: "This shift has ended.",
  cancelled: "The employer cancelled this shift.",
  draft: "This shift hasn't been published yet.",
};

/**
 * Primary action for the shift. Fixed above the tab bar on phones (thumb reach), inline at the end of the
 * content on large screens. Copy and controls follow the worker's booking, then the shift status.
 */
export function ShiftActionBar({ shift, employerName, workerId, booking, bookingPending }: ShiftActionBarProps) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const hours = shiftHours(shift.startTime, shift.endTime, shift.breakMinutes);

  let line: ReactNode = `per shift · ${hours}h · ${formatRelativeDay(shift.date)}`;
  let action: ReactNode;

  if (bookingPending) {
    action = <Skeleton className="h-12 w-40" />;
  } else if (booking?.status === "invited") {
    line = <span className="text-amber-700">You&apos;re invited — respond to secure your place</span>;
    action = <InviteActions bookingId={booking.id} shiftTitle={shift.title} employerName={employerName} size="lg" className="w-full sm:w-auto" />;
  } else if (booking?.status === "applied") {
    line = <span className="inline-flex items-center gap-1 text-cyan-800"><Clock className="size-3.5" aria-hidden /> Application sent{employerName ? ` · waiting on ${employerName}` : null}</span>;
    action = <Button variant="outline" size="lg" onClick={() => setWithdrawOpen(true)}>Withdraw</Button>;
  } else if (booking?.status === "confirmed") {
    line = <span className="inline-flex items-center gap-1 text-success-700"><Check className="size-3.5" strokeWidth={2.5} aria-hidden /> You&apos;re confirmed · {formatRelativeDay(shift.date)}</span>;
    action = <Button size="lg" asChild><Link href="/worker/schedule"><CalendarCheck /> View in schedule</Link></Button>;
  } else if (booking?.status === "checked_in") {
    line = <span className="text-amber-700">You&apos;re checked in — enjoy the shift</span>;
    action = <Button size="lg" asChild><Link href="/worker/schedule">Open schedule</Link></Button>;
  } else if (booking?.status === "completed") {
    line = "You worked this shift";
    action = <Button variant="outline" size="lg" asChild><Link href="/worker/schedule">Open schedule</Link></Button>;
  } else if (booking?.status === "no_show") {
    line = <span className="text-danger-600">Marked as a no-show</span>;
    action = <Button variant="outline" size="lg" asChild><Link href="/worker/schedule">Open schedule</Link></Button>;
  } else if (shift.status !== "open") {
    line = CLOSED_COPY[shift.status];
    action = <Button size="lg" disabled>Apply</Button>;
  } else {
    action = <Button size="lg" onClick={() => setApplyOpen(true)}>Apply for this shift</Button>;
  }

  const wide = booking?.status === "invited";

  return (
    <>
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-6 lg:static lg:rounded-lg lg:border-0 lg:bg-surface lg:p-5 lg:shadow-card lg:backdrop-blur-none">
        <div className={`mx-auto flex max-w-3xl items-center gap-3 ${wide ? "flex-col items-stretch sm:flex-row sm:items-center" : ""}`}>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold leading-none text-navy-900 tabular">{formatRwf(shift.payPerShift)}</p>
            <p className="mt-1 truncate text-xs text-fg-muted">{line}</p>
          </div>
          <div className="shrink-0">{action}</div>
        </div>
      </div>

      <ApplyDialog open={applyOpen} onOpenChange={setApplyOpen} shift={shift} employerName={employerName} workerId={workerId} />
      {booking && (booking.status === "applied" || booking.status === "confirmed") ? (
        <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} bookingId={booking.id} status={booking.status} shiftTitle={shift.title} employerName={employerName} />
      ) : null}
    </>
  );
}
