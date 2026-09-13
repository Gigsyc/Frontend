"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { RoleIcon } from "@/components/common/role-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/empty-state";
import { FillMeter } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeDay, formatRwf, formatTimeRange } from "@/lib/utils";
import { useFeaturedShift } from "../../hooks/use-featured-shift";

const frame = "rounded-lg bg-surface p-4 shadow-pop";

/** Hero overlay: one real open shift from the marketplace, filling in real time. */
export function LiveShiftCard() {
  const { shift, employer, confirmed, isEmpty, isPending, isError, error, isRefetching, refetch } = useFeaturedShift();

  if (isError) {
    return (
      <div className={frame}>
        <ErrorState compact title="Live shifts unavailable" error={error} onRetry={() => refetch()} retrying={isRefetching} />
      </div>
    );
  }

  if (isPending || !shift) {
    if (isEmpty) {
      return (
        <div className={frame}>
          <p className="text-sm font-semibold text-fg">No open shifts right now</p>
          <p className="mt-1 text-[13px] text-fg-muted">Every position on the marketplace is filled. Post one and it will appear here.</p>
          <Button size="sm" className="mt-3" asChild><Link href="/login?as=employer">Post a shift</Link></Button>
        </div>
      );
    }
    return (
      <div className={frame} aria-busy>
        <div className="flex items-center justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-4 w-12" /></div>
        <div className="mt-3 flex gap-3">
          <Skeleton className="size-8 rounded-md" />
          <div className="flex-1"><Skeleton className="h-3 w-28" /><Skeleton className="mt-2 h-4 w-full" /></div>
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="mt-2 h-1.5 w-full" />
      </div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={frame}
      aria-label="Live open shift"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted">
          <span className="size-2 rounded-full bg-cyan-500" aria-hidden /> Live · open shift
        </span>
        {shift.urgent ? <Badge tone="solid-amber"><Zap className="fill-current" /> Urgent</Badge> : <span className="text-xs text-fg-subtle">{formatRelativeDay(shift.date)}</span>}
      </div>
      <div className="mt-3 flex items-start gap-3">
        <RoleIcon role={shift.role} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-fg-muted">{employer?.name ?? "Verified employer"} · {shift.district}</p>
          <h3 className="mt-0.5 line-clamp-2 font-sans text-[15px] font-semibold leading-5 tracking-normal text-fg">{shift.title}</h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-lg font-semibold leading-none text-navy-900 tabular">{formatRwf(shift.payPerShift)}</p>
          <p className="mt-1 text-[11px] text-fg-muted">per shift</p>
        </div>
      </div>
      <FillMeter filled={confirmed} needed={shift.workersNeeded} className="mt-4" />
      <p className="mt-2.5 text-xs text-fg-muted">{formatTimeRange(shift.startTime, shift.endTime)} · {shift.venue}</p>
    </motion.article>
  );
}
