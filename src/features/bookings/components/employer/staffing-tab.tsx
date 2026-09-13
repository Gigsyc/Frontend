"use client";

import { AnimatePresence } from "motion/react";
import { Inbox } from "lucide-react";
import { WorkerCardSkeleton } from "@/components/common";
import { Card, CardContent, EmptyState, ErrorState, SectionHeading, Skeleton } from "@/components/ui";
import { useShiftCandidates } from "@/features/shifts";
import type { Shift } from "@/types";
import { ApplicationCard } from "./application-card";
import { SeatedList } from "./seated-list";
import { SuggestedCandidates } from "./suggested-candidates";
import type { useShiftStaffing } from "./use-shift-staffing";

interface StaffingTabProps {
  shift: Shift;
  staffing: ReturnType<typeof useShiftStaffing>;
  poolIds: ReadonlySet<string>;
  canInvite: boolean;
}

export function StaffingTab({ shift, staffing, poolIds, canInvite }: StaffingTabProps) {
  const candidates = useShiftCandidates(shift.id);
  const reasonsFor = (workerId: string) => candidates.data?.find((c) => c.worker.id === workerId)?.reasons;

  if (staffing.isPending) return <StaffingSkeleton />;
  if (staffing.isError) return <ErrorState title="We couldn't load staffing" error={staffing.error} onRetry={() => void staffing.refetch()} retrying={staffing.isRefetching} />;

  const applications = staffing.byStatus(["applied"]);
  const confirmed = staffing.byStatus(["confirmed", "checked_in", "completed"]);
  const invited = staffing.byStatus(["invited"]);
  const full = staffing.counts.filled >= shift.workersNeeded;

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <SectionHeading
          title={`Applications${applications.length ? ` (${applications.length})` : ""}`}
          description={full ? "All positions are filled. Remove someone or raise the headcount to confirm more." : `${Math.max(0, shift.workersNeeded - staffing.counts.filled)} still to confirm.`}
        />
        {applications.length === 0 ? (
          <Card><EmptyState compact icon={Inbox} title="No applications waiting" description={canInvite ? "Invite a few suggested workers below to speed things up." : "This shift isn't taking applications."} /></Card>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            <AnimatePresence initial={false}>
              {applications.map((row, i) => <ApplicationCard key={row.booking.id} row={row} shift={shift} full={full} reasons={reasonsFor(row.worker.id)} index={i} />)}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <SectionHeading as="h3" title={`Confirmed (${confirmed.length} of ${shift.workersNeeded})`} />
            {confirmed.length === 0 ? <p className="mt-3 text-sm text-fg-muted">No one confirmed yet.</p> : <SeatedList rows={confirmed} kind="confirmed" />}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <SectionHeading as="h3" title={`Invited (${invited.length})`} />
            {invited.length === 0 ? <p className="mt-3 text-sm text-fg-muted">No open invitations.</p> : <SeatedList rows={invited} kind="invited" />}
          </CardContent>
        </Card>
      </div>

      <SuggestedCandidates shift={shift} excludeIds={staffing.attachedWorkerIds} poolIds={poolIds} canInvite={canInvite} />
    </div>
  );
}

function StaffingSkeleton() {
  return (
    <div className="space-y-8" aria-busy>
      <div className="space-y-4"><Skeleton className="h-5 w-40" /><div className="grid gap-4 md:grid-cols-2"><WorkerCardSkeleton /><WorkerCardSkeleton /></div></div>
      <div className="grid gap-6 lg:grid-cols-2">{[0, 1].map((i) => <Skeleton key={i} className="h-48" />)}</div>
    </div>
  );
}
