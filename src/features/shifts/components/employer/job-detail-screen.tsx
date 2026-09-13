"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, SearchX, Zap } from "lucide-react";
import { Badge, Button, EmptyState, ErrorState, PageHeader, ShiftStatusBadge, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { AttendanceTab, InviteDrawer, ReviewTab, StaffingTab, useShiftStaffing } from "@/features/bookings/components/employer";
import { useEmployerSession } from "@/features/session";
import { useTalentPool } from "@/features/talent-pool";
import { ROLES } from "@/data/roles";
import { formatRelativeDay, formatRwf, formatTimeRange } from "@/lib/utils";
import { useShift } from "../../queries";
import { CancelShiftDialog } from "./cancel-shift-dialog";
import { JobDetailActions } from "./job-detail-actions";
import { JobDetailSkeleton } from "./job-detail-skeleton";
import { JobOverviewTab } from "./job-overview-tab";
import { isNotFound, STAFFABLE } from "./shift-helpers";
import { StaffingBar } from "./staffing-bar";

const TABS = ["overview", "staffing", "attendance", "review"] as const;
type Tab = (typeof TABS)[number];
const isTab = (v: string | null): v is Tab => !!v && (TABS as readonly string[]).includes(v);

/** /employer/jobs/[id] — one shift, everything the ops manager does with it. Tab lives in ?tab=. */
export function JobDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { employerId } = useEmployerSession();
  const shiftQ = useShift(id);
  const staffing = useShiftStaffing(id);
  const poolQ = useTalentPool(employerId);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const tab: Tab = isTab(sp.get("tab")) ? (sp.get("tab") as Tab) : "overview";
  const setTab = useCallback(
    (next: string) => {
      const params = new URLSearchParams(sp.toString());
      if (next === "overview") params.delete("tab");
      else params.set("tab", next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [sp, router, pathname],
  );

  const poolIds = useMemo(() => new Set((poolQ.data ?? []).map((t) => t.workerId)), [poolQ.data]);

  if (shiftQ.isPending) return <JobDetailSkeleton />;
  if (shiftQ.isError) {
    if (isNotFound(shiftQ.error)) {
      return (
        <EmptyState
          icon={SearchX}
          title="This shift no longer exists"
          description="It may have been removed, or the link is out of date."
          action={<Button asChild><Link href="/employer/jobs"><ChevronLeft /> Back to Jobs</Link></Button>}
          className="rounded-lg bg-surface shadow-card"
        />
      );
    }
    return <ErrorState title="We couldn't load this shift" error={shiftQ.error} onRetry={() => void shiftQ.refetch()} retrying={shiftQ.isRefetching} className="rounded-lg bg-surface shadow-card" />;
  }

  const shift = shiftQ.data;
  const canInvite = STAFFABLE.has(shift.status);
  const counts = staffing.isPending || staffing.isError ? null : staffing.counts;
  const venue = shift.venue.trim();

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/employer/jobs"
        backLabel="Jobs"
        eyebrow={venue ? `${ROLES[shift.role].label} · ${venue}` : ROLES[shift.role].label}
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {shift.title}
            <span className="inline-flex items-center gap-1.5 align-middle">
              <ShiftStatusBadge status={shift.status} />
              {shift.urgent ? <Badge tone="solid-amber"><Zap className="fill-current" /> Urgent</Badge> : null}
            </span>
          </span>
        }
        description={
          <span className="tabular">
            {formatRelativeDay(shift.date)} · {formatTimeRange(shift.startTime, shift.endTime)} · {formatRwf(shift.payPerShift)} per worker · {shift.workersNeeded} needed
          </span>
        }
        actions={<JobDetailActions shift={shift} onCancel={() => setCancelOpen(true)} />}
      />

      <StaffingBar
        shift={shift}
        counts={counts}
        onInvite={() => setInviteOpen(true)}
        canInvite={canInvite}
        isError={staffing.isError}
        onRetry={() => void staffing.refetch()}
        retrying={staffing.isRefetching}
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList aria-label="Shift sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staffing" count={counts?.applied || undefined}>Staffing</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="review" count={counts?.pendingApproval || undefined}>Review & approve</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><JobOverviewTab shift={shift} /></TabsContent>
        <TabsContent value="staffing"><StaffingTab shift={shift} staffing={staffing} poolIds={poolIds} canInvite={canInvite} /></TabsContent>
        <TabsContent value="attendance"><AttendanceTab shift={shift} staffing={staffing} /></TabsContent>
        <TabsContent value="review"><ReviewTab shift={shift} staffing={staffing} /></TabsContent>
      </Tabs>

      <InviteDrawer open={inviteOpen} onOpenChange={setInviteOpen} shift={shift} excludeIds={staffing.attachedWorkerIds} poolIds={poolIds} />
      <CancelShiftDialog
        shift={cancelOpen ? shift : null}
        onClose={() => setCancelOpen(false)}
        affected={counts ? counts.filled + counts.applied + counts.invited : undefined}
        onCancelled={(s) => { if (s.status === "draft") router.push("/employer/jobs"); }}
      />
    </div>
  );
}
