"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCheck, Flag, ShieldCheck, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/tabs";
import { useReports } from "@/features/admin";
import { useStaggerOnce } from "@/lib/motion";
import { pluralize } from "@/lib/utils";
import type { Report, ReportStatus } from "@/types";
import { ReportRow } from "./report-row";
import { ResolveReportDialog, type Outcome } from "./resolve-report-dialog";

const TABS: ReportStatus[] = ["open", "resolved", "dismissed"];
const LABEL: Record<ReportStatus, string> = { open: "Open", resolved: "Resolved", dismissed: "Dismissed" };

const EMPTY: Record<ReportStatus, { icon: LucideIcon; title: string; description: string }> = {
  open: { icon: ShieldCheck, title: "Nothing waiting", description: "Every report has been dealt with. New ones land here the moment a customer sends them." },
  resolved: { icon: CheckCheck, title: "No resolved reports yet", description: "Reports you resolve keep their note here so the next person can see what was done." },
  dismissed: { icon: Flag, title: "No dismissed reports", description: "Reports you dismiss stay here with the reason no action was needed." },
};

function ReportsSkeleton() {
  return (
    <div aria-hidden className="divide-y divide-border">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="p-5">
          <div className="flex gap-2"><Skeleton className="h-5 w-16 rounded-sm" /><Skeleton className="h-5 w-14 rounded-sm" /><Skeleton className="h-5 w-40 rounded-sm" /></div>
          <Skeleton className="mt-3 h-4 w-64 max-w-full" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/** /admin/moderation — what customers have flagged, newest first. */
export function ModerationScreen() {
  const reports = useReports();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [target, setTarget] = useState<{ report: Report; outcome: Outcome } | null>(null);

  const raw = searchParams.get("tab");
  const tab: ReportStatus = TABS.includes(raw as ReportStatus) ? (raw as ReportStatus) : "open";
  const setTab = (next: ReportStatus) => router.replace(next === "open" ? pathname : `${pathname}?tab=${next}`, { scroll: false });

  const all = useMemo(() => reports.data ?? [], [reports.data]);
  const counts = useMemo(
    () => ({
      open: all.filter((r) => r.status === "open").length,
      resolved: all.filter((r) => r.status === "resolved").length,
      dismissed: all.filter((r) => r.status === "dismissed").length,
    }),
    [all],
  );
  // The store already sorts newest first; filtering keeps that order.
  const rows = useMemo(() => all.filter((r) => r.status === tab), [all, tab]);
  const empty = EMPTY[tab];
  const stagger = useStaggerOnce(rows.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderation"
        description={
          reports.isPending
            ? "What customers have flagged on events, organisers and profiles."
            : counts.open === 0
              ? "Nothing is waiting on you. Resolved and dismissed reports keep their notes below."
              : `${pluralize(counts.open, "report")} waiting on a decision.`
        }
      />

      {/* Counts only once the data is in — three zeros beside an error panel would be a guess. */}
      <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
        <Segmented
          ariaLabel="Report status"
          value={tab}
          onChange={setTab}
          options={TABS.map((t) => ({ value: t, label: LABEL[t], count: reports.isSuccess ? counts[t] : undefined }))}
        />
      </div>

      <Card className="overflow-hidden">
        {reports.isPending ? (
          <ReportsSkeleton />
        ) : reports.isError ? (
          <ErrorState title="We couldn't load reports" error={reports.error} onRetry={() => void reports.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((report, i) => (
              <ReportRow key={report.id} report={report} animation={stagger(i)} onAct={(r, outcome) => setTarget({ report: r, outcome })} />
            ))}
          </ul>
        )}
      </Card>

      <ResolveReportDialog target={target} onClose={() => setTarget(null)} />
    </div>
  );
}

/** Route-level fallback while the URL tab resolves. */
export function ModerationScreenSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Moderation" description="What customers have flagged on events, organisers and profiles." />
      <Skeleton className="h-9 w-64 rounded-md" />
      <Card className="overflow-hidden"><ReportsSkeleton /></Card>
    </div>
  );
}
