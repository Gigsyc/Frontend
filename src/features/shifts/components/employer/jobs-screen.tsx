"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Briefcase, Inbox, Plus, X } from "lucide-react";
import { Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from "@/components/ui";
import { useEmployerSession } from "@/features/session";
import type { Shift } from "@/types";
import { CancelShiftDialog } from "./cancel-shift-dialog";
import { countByStatus, EMPTY_COPY, filterAndSortJobs, type JobsFilterState, type JobsQuery } from "./jobs-filters";
import { JobsTable, JobsTableSkeleton } from "./jobs-table";
import { JobsToolbar } from "./jobs-toolbar";
import { EMPTY_COUNTS } from "./shift-helpers";
import { useEmployerJobs } from "./use-employer-jobs";

/**
 * /employer/jobs — every shift the employer has posted, drafts included.
 * `?filter=applications` is read from the URL (not seeded into state) so arriving here from the
 * dashboard or a notification applies the filter even when Jobs is already on screen.
 */
export function JobsScreen() {
  const router = useRouter();
  const sp = useSearchParams();
  const { employerId } = useEmployerSession();
  const jobs = useEmployerJobs(employerId);
  const [filters, setFilters] = useState<JobsFilterState>({ search: "", status: "all", sort: "soonest" });
  const [cancelling, setCancelling] = useState<Shift | null>(null);

  const applicationsOnly = sp.get("filter") === "applications";
  const query = useMemo<JobsQuery>(() => ({ ...filters, applicationsOnly }), [filters, applicationsOnly]);

  const shifts = useMemo(() => jobs.shifts ?? [], [jobs.shifts]);
  const statusCounts = useMemo(() => countByStatus(shifts), [shifts]);
  const visible = useMemo(() => filterAndSortJobs(shifts, jobs.countsByShift, query), [shifts, jobs.countsByShift, query]);
  const filtered = query.search.trim() !== "" || query.status !== "all" || applicationsOnly;

  const dismissApplications = () => router.replace("/employer/jobs", { scroll: false });

  const affected = (s: Shift) => {
    const c = jobs.countsByShift[s.id] ?? EMPTY_COUNTS;
    return c.filled + c.applied + c.invited;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Jobs"
        description="Every shift you've posted — open, filled, running and finished. Drafts stay private until you post them."
        actions={<Button asChild><Link href="/employer/jobs/new"><Plus /> Post a shift</Link></Button>}
      />

      {applicationsOnly ? (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm text-cyan-900">
          <span className="inline-flex items-center gap-2"><Inbox className="size-4" aria-hidden /> Showing shifts with applications to review.</span>
          <Button variant="ghost" size="icon-sm" aria-label="Show all shifts" onClick={dismissApplications} className="size-11 shrink-0 text-cyan-900 hover:bg-cyan-100 sm:size-8"><X /></Button>
        </div>
      ) : null}

      <Card>
        <JobsToolbar query={query} counts={statusCounts} onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))} resultCount={visible.length} />

        {jobs.isPending ? (
          <JobsTableSkeleton />
        ) : jobs.isError ? (
          <ErrorState title="We couldn't load your shifts" error={jobs.error} onRetry={() => void jobs.refetch()} retrying={jobs.isRefetching} />
        ) : shifts.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No shifts yet"
            description="Post your first shift and we'll notify verified workers with the right skills straight away."
            action={<Button asChild><Link href="/employer/jobs/new"><Plus /> Post a shift</Link></Button>}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            compact
            icon={Briefcase}
            title={applicationsOnly ? "No applications waiting" : EMPTY_COPY[query.status].title}
            description={applicationsOnly ? "You're up to date. New applications will show here as they arrive." : EMPTY_COPY[query.status].description}
            action={filtered ? <Button variant="outline" size="sm" onClick={() => { setFilters((f) => ({ ...f, search: "", status: "all" })); if (applicationsOnly) dismissApplications(); }}>Clear filters</Button> : undefined}
          />
        ) : (
          <JobsTable shifts={visible} counts={jobs.countsByShift} onDuplicate={(s) => router.push(`/employer/jobs/new?from=${s.id}`)} onCancel={setCancelling} />
        )}
      </Card>

      <CancelShiftDialog shift={cancelling} onClose={() => setCancelling(null)} affected={cancelling ? affected(cancelling) : undefined} />
    </div>
  );
}

/** Suspense fallback for the page — the screen reads ?filter= from the URL. */
export function JobsScreenSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading shifts">
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5">
          <Skeleton className="h-10 w-full md:max-w-xs" />
          <Skeleton className="h-8 w-72 max-w-full rounded-md" />
        </div>
        <JobsTableSkeleton />
      </Card>
    </div>
  );
}
