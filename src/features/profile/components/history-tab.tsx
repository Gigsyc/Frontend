"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Briefcase } from "lucide-react";
import { EmployerMark } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Rating } from "@/components/ui/rating";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLES } from "@/data/roles";
import { useEmployers } from "@/features/employers";
import { formatDate } from "@/lib/utils";
import type { Employer, WorkHistoryItem, Worker } from "@/types";
import { historySummary, sortNewestFirst } from "../lib/history";
import { staggerItem } from "../lib/motion";

function HistoryItem({ item, employer, loadingEmployer }: { item: WorkHistoryItem; employer?: Employer; loadingEmployer: boolean }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {employer ? <EmployerMark employer={employer} size="sm" /> : loadingEmployer ? <Skeleton className="size-8 rounded-md" /> : <span className="inline-flex size-8 items-center justify-center rounded-md bg-ink-100 text-fg-muted"><Briefcase className="size-4" aria-hidden /></span>}
        <div className="min-w-0 flex-1">
          {employer ? <p className="truncate text-[13px] font-medium text-fg-muted">{employer.name}</p> : loadingEmployer ? <Skeleton className="h-3 w-32" /> : <p className="text-[13px] text-fg-muted">Employer</p>}
          <h3 className="mt-0.5 text-[15px] font-semibold leading-5 text-fg">{item.title}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-fg-muted">
            <Badge tone="outline">{ROLES[item.role].short}</Badge>
            <span>{formatDate(item.date)}</span>
            <span className="tabular">{item.hours}h</span>
          </div>
        </div>
        {typeof item.rating === "number" ? <Rating value={item.rating} size="md" className="shrink-0" /> : null}
      </div>
      {item.feedback ? <blockquote className="mt-3 border-l-2 border-amber-500 pl-3 text-sm italic leading-6 text-fg">&ldquo;{item.feedback}&rdquo;</blockquote> : null}
    </Card>
  );
}

export function HistoryTab({ worker }: { worker: Worker }) {
  const employers = useEmployers();
  const items = sortNewestFirst(worker.history);
  const summary = historySummary(items, worker.completedShifts);
  const byId = new Map((employers.data ?? []).map((e) => [e.id, e]));

  if (!items.length) {
    return (
      <Card>
        <EmptyState
          icon={Briefcase}
          title="No shifts yet"
          description="Your completed shifts, hours and employer feedback show up here once your first shift is approved."
          action={<Button asChild><Link href="/worker">Browse open shifts</Link></Button>}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-muted">
        <span className="font-semibold text-fg tabular">{worker.completedShifts}</span> shifts ·{" "}
        <span className="font-semibold text-fg tabular">{summary.isEstimate ? `about ${summary.totalHours}` : summary.totalHours}</span> hours ·{" "}
        <span className="font-semibold text-fg tabular">{worker.rating.toFixed(1)}</span> average
      </p>
      <ul className="space-y-3">
        {items.map((h, i) => (
          <motion.li key={h.id} {...staggerItem(i)}>
            <HistoryItem item={h} employer={byId.get(h.employerId)} loadingEmployer={employers.isPending} />
          </motion.li>
        ))}
      </ul>
      {summary.isEstimate ? <p className="text-xs text-fg-subtle">Showing your {items.length} most recent verified shifts. Earlier shifts still count towards your totals.</p> : null}
    </div>
  );
}
