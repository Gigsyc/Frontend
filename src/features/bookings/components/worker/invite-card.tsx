"use client";

import Link from "next/link";
import { CalendarDays, Clock, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { EmployerMark } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useShift } from "@/features/shifts/queries";
import { formatRelativeDay, formatRwf, formatTimeRange } from "@/lib/utils";
import type { Booking, Employer } from "@/types";
import { InviteActions } from "./invite-actions";

const EASE = [0.22, 1, 0.36, 1] as const;

interface InviteListProps {
  invites: Booking[];
  employerById: Map<string, Employer>;
}

/** Open invitations, amber-accented and pinned above the feed. Cards leave with a short exit once decided. */
export function InviteList({ invites, employerById }: InviteListProps) {
  const [decided, setDecided] = useState<Set<string>>(() => new Set());
  const visible = invites.filter((b) => !decided.has(b.id));
  if (visible.length === 0) return null;
  return (
    <section aria-label="Invitations" className="space-y-3">
      <AnimatePresence initial={false}>
        {visible.map((b) => (
          <motion.div
            key={b.id}
            layout
            exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.3, ease: EASE } }}
            className="overflow-hidden"
          >
            <InviteCard booking={b} employerById={employerById} onDecided={() => setDecided((s) => new Set(s).add(b.id))} />
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}

function InviteCard({ booking, employerById, onDecided }: { booking: Booking; employerById: Map<string, Employer>; onDecided: () => void }) {
  const shiftQ = useShift(booking.shiftId);
  const shift = shiftQ.data;
  const employer = shift ? employerById.get(shift.employerId) : undefined;
  const href = `/worker/shifts/${booking.shiftId}`;

  return (
    <Card className="overflow-hidden ring-1 ring-amber-300">
      <div className="flex items-center gap-1.5 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900">
        <Mail className="size-3.5" aria-hidden /> You&apos;re invited
      </div>
      {shiftQ.isPending ? (
        <div className="space-y-3 p-4" aria-hidden>
          <div className="flex gap-3"><Skeleton className="size-10 rounded-md" /><div className="flex-1"><Skeleton className="h-3 w-32" /><Skeleton className="mt-2 h-4 w-3/4" /></div></div>
          <Skeleton className="h-10" />
        </div>
      ) : !shift ? (
        <ErrorState
          compact
          title="We couldn't load this invitation"
          error={shiftQ.error}
          onRetry={() => void shiftQ.refetch()}
          retrying={shiftQ.isRefetching}
        />
      ) : (
        <div className="space-y-4 p-4">
          <div className="flex items-start gap-3">
            {employer ? <EmployerMark employer={employer} size="md" /> : <Skeleton className="size-10 rounded-md" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-fg-muted">{employer?.name ?? "Employer"} wants you on this shift</p>
              <Link href={href} className="mt-0.5 block font-sans text-[15px] font-semibold leading-5 text-fg hover:text-navy-800">{shift.title}</Link>
              <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-fg-muted [&_svg]:size-3.5 [&_svg]:text-fg-subtle">
                <li className="inline-flex items-center gap-1"><CalendarDays aria-hidden />{formatRelativeDay(shift.date)}</li>
                <li className="inline-flex items-center gap-1"><Clock aria-hidden />{formatTimeRange(shift.startTime, shift.endTime)}</li>
              </ul>
            </div>
            <p className="shrink-0 font-display text-lg font-semibold leading-none text-navy-900 tabular">{formatRwf(shift.payPerShift)}</p>
          </div>
          <InviteActions bookingId={booking.id} shiftTitle={shift.title} employerName={employer?.name} onDecided={onDecided} />
          <Link href={href} className="block text-center text-[13px] font-medium text-navy-700 underline-offset-4 hover:underline">See shift details</Link>
        </div>
      )}
    </Card>
  );
}
