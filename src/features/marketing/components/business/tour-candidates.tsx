"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check, Users } from "lucide-react";
import { WorkerAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Rating } from "@/components/ui/rating";
import { VerifiedMark } from "@/components/ui/verified";
import { useShiftCandidates } from "@/features/shifts";
import type { Shift } from "@/types";
import { TourFrame, TourRowsSkeleton, listMotion } from "./tour-frame";

/** Ranked candidates for the employer's biggest open job. Read-only in the tour — the Confirm buttons lead to the login. */
export function TourCandidates({ shift, parentPending }: { shift?: Shift; parentPending: boolean }) {
  const candidates = useShiftCandidates(shift?.id);
  const top = candidates.data?.slice(0, 3) ?? [];

  return (
    <TourFrame title={shift ? `Staffing · ${shift.title}` : "Staffing"}>
      {candidates.isError ? (
        <ErrorState compact title="Couldn't rank candidates" error={candidates.error} onRetry={() => candidates.refetch()} retrying={candidates.isRefetching} />
      ) : parentPending || (shift && candidates.isPending) ? (
        <TourRowsSkeleton rows={3} />
      ) : !shift || top.length === 0 ? (
        <EmptyState compact icon={Users} title="Nothing to staff right now" description="When a job is open, matching professionals are ranked here by skills, distance and track record." />
      ) : (
        <ul className="flex flex-col gap-2">
          {top.map(({ worker, reasons }, i) => (
            <motion.li
              key={worker.id}
              initial={listMotion.initial}
              animate={listMotion.animate}
              transition={listMotion.transition(i)}
              className="flex items-start gap-3 rounded-md border border-border p-3"
            >
              <WorkerAvatar worker={worker} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p className="text-sm font-semibold text-fg">{worker.firstName} {worker.lastName}</p>
                  <VerifiedMark verifications={worker.verifications} />
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-fg-muted">
                  <Rating value={worker.rating} count={worker.ratingCount} />
                  <span className="tabular"><span className="font-semibold text-fg">{worker.reliability}%</span> reliable</span>
                  <span className="tabular"><span className="font-semibold text-fg">{worker.completedShifts}</span> shifts</span>
                </div>
                {reasons.length ? (
                  <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-success-700">
                    {reasons.slice(0, 2).map((r) => <li key={r} className="inline-flex items-center gap-1"><Check className="size-3" strokeWidth={3} aria-hidden />{r}</li>)}
                  </ul>
                ) : null}
              </div>
              <Button size="sm" variant="secondary" className="hidden shrink-0 sm:inline-flex" asChild>
                <Link href="/login?as=employer">Confirm</Link>
              </Button>
            </motion.li>
          ))}
        </ul>
      )}
    </TourFrame>
  );
}
