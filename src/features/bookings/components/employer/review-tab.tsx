"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { ClipboardCheck, Star, Stars } from "lucide-react";
import { toast } from "sonner";
import {
  Button, Card, CardContent, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  EmptyState, ErrorState, Rating, SectionHeading, Skeleton, WorkerAvatar,
} from "@/components/ui";
import { useApproveBooking } from "@/features/bookings";
import { formatRwf, formatTimeAgo } from "@/lib/utils";
import type { Shift } from "@/types";
import { payoutFor, ReviewRow } from "./review-row";
import type { StaffingRow, useShiftStaffing } from "./use-shift-staffing";

interface ReviewTabProps {
  shift: Shift;
  staffing: ReturnType<typeof useShiftStaffing>;
}

export function ReviewTab({ shift, staffing }: ReviewTabProps) {
  const [bulkOpen, setBulkOpen] = useState(false);
  const approve = useApproveBooking();

  if (staffing.isPending) return <div className="space-y-4" aria-busy>{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40" />)}</div>;
  if (staffing.isError) return <ErrorState title="We couldn't load this shift's workers" error={staffing.error} onRetry={() => void staffing.refetch()} retrying={staffing.isRefetching} />;

  const completed = staffing.byStatus(["completed"]);
  const pending = completed.filter((r) => !r.booking.approvedAt);
  const approved = completed.filter((r) => r.booking.approvedAt).sort((a, b) => (b.booking.approvedAt ?? "").localeCompare(a.booking.approvedAt ?? ""));

  if (completed.length === 0) {
    return <Card><EmptyState icon={ClipboardCheck} title="Nothing to review until the shift is completed" description="Once workers check out, you approve each one here and their pay is released to mobile money." /></Card>;
  }

  const approveAll = async () => {
    let done = 0;
    for (const r of pending) {
      try {
        await approve.mutateAsync({ bookingId: r.booking.id, rating: { score: 5, punctuality: 5, professionalism: 5, competence: 5 } });
        done += 1;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Couldn't approve ${r.worker.firstName}.`);
      }
    }
    setBulkOpen(false);
    if (done) toast.success(`Approved ${done} ${done === 1 ? "worker" : "workers"}`, { description: `${formatRwf(done * payoutFor(shift))} is on its way to them.` });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <SectionHeading
          title={pending.length ? `Approve & rate (${pending.length})` : "Approve & rate"}
          description={pending.length ? `Each approval releases ${formatRwf(payoutFor(shift))} to the worker's mobile money.` : "Everyone on this shift has been approved."}
          action={pending.length > 1 ? <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}><Stars /> Approve all with 5 stars</Button> : undefined}
        />
        {pending.length === 0 ? (
          <Card><EmptyState compact icon={ClipboardCheck} title="All approved" description="Ratings are saved to each worker's profile. Payouts show under Payments." action={<Button variant="outline" size="sm" asChild><Link href="/employer/payments">Go to Payments</Link></Button>} /></Card>
        ) : (
          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {pending.map((row, i) => <ReviewRow key={row.booking.id} row={row} shift={shift} index={i} />)}
            </AnimatePresence>
          </ul>
        )}
      </section>

      {approved.length ? (
        <section className="space-y-4">
          <SectionHeading title={`Approved (${approved.length})`} />
          <Card><CardContent className="py-2"><ApprovedList rows={approved} /></CardContent></Card>
        </section>
      ) : null}

      <Dialog open={bulkOpen} onOpenChange={(o) => { if (!approve.isPending) setBulkOpen(o); }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Approve all {pending.length} with 5 stars?</DialogTitle>
            <DialogDescription>Every worker still waiting gets a 5-star rating on all counts and {formatRwf(payoutFor(shift))} released — {formatRwf(pending.length * payoutFor(shift))} in total. You can&apos;t change ratings afterwards.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={approve.isPending}>Rate individually</Button></DialogClose>
            <Button onClick={() => void approveAll()} loading={approve.isPending}><Star className="fill-current" /> Approve all</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApprovedList({ rows }: { rows: StaffingRow[] }) {
  return (
    <ul className="divide-y divide-border">
      {rows.map(({ worker, booking }) => {
        const r = booking.employerRating;
        return (
          <li key={booking.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <WorkerAvatar worker={worker} size="sm" />
              <div className="min-w-0">
                <Link href={`/employer/talent/${worker.id}`} className="truncate text-sm font-medium text-fg hover:text-navy-800">{worker.firstName} {worker.lastName}</Link>
                <p className="text-xs text-fg-muted">Approved {booking.approvedAt ? formatTimeAgo(booking.approvedAt) : ""}{r?.note ? ` · “${r.note}”` : ""}</p>
              </div>
            </div>
            {r ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted sm:justify-end">
                <Rating value={r.score} size="md" />
                <span className="tabular">Punctuality {r.punctuality}</span>
                <span className="tabular">Professionalism {r.professionalism}</span>
                <span className="tabular">Competence {r.competence}</span>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
