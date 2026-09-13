"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { BookingStatusBadge, Button } from "@/components/ui";
import { formatRwf } from "@/lib/utils";
import type { ScheduleItem } from "../types";
import { DateColumn } from "./schedule-row";

interface PastRowProps {
  item: ScheduleItem;
  onRate: (item: ScheduleItem) => void;
}

/** History row: outcome badge, the rating you received, and a nudge to rate the employer back. */
export function PastRow({ item, onRate }: PastRowProps) {
  const { shift, employer, booking } = item;
  const received = booking.employerRating?.score;
  const given = booking.workerRating?.score;
  const canRate = booking.status === "completed" && !booking.workerRating;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <DateColumn date={shift.date} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href={`/worker/shifts/${shift.id}`} className="truncate text-[15px] font-semibold text-fg hover:text-navy-800">{shift.title}</Link>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="truncate text-[13px] text-fg-muted">
          {employer?.name ?? "Employer"}
          {booking.status === "completed" ? <> · <span className="tabular">{formatRwf(shift.payPerShift + (shift.transportAllowance ?? 0))}</span></> : null}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {typeof received === "number" ? (
            <span className="inline-flex items-center gap-1 text-fg-muted" aria-label={`They rated you ${received.toFixed(1)} out of 5`}>
              They rated you <Star className="size-3.5 fill-amber-500 text-amber-500" aria-hidden /><span className="font-semibold text-fg tabular">{received.toFixed(1)}</span>
            </span>
          ) : booking.status === "completed" ? (
            <span className="text-fg-subtle">Not rated yet</span>
          ) : null}
          {typeof given === "number" ? (
            <span className="inline-flex items-center gap-1 text-fg-muted" aria-label={`You rated them ${given} out of 5`}>
              You rated <Star className="size-3.5 fill-amber-500 text-amber-500" aria-hidden /><span className="font-semibold text-fg tabular">{given.toFixed(1)}</span>
            </span>
          ) : null}
        </div>
      </div>
      {canRate ? (
        <Button variant="outline" size="sm" className="min-h-11 shrink-0 sm:min-h-8" onClick={() => onRate(item)}><Star /> Rate employer</Button>
      ) : null}
    </div>
  );
}
