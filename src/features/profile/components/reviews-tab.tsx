"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import { EmployerMark } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { ROLES } from "@/data/roles";
import { useEmployers } from "@/features/employers";
import { formatDate } from "@/lib/utils";
import type { Worker } from "@/types";
import { historySummary, ratingDistribution, sortNewestFirst } from "../lib/history";
import { staggerItem } from "../lib/motion";

export function ReviewsTab({ worker }: { worker: Worker }) {
  const employers = useEmployers();
  const byId = new Map((employers.data ?? []).map((e) => [e.id, e]));
  const items = sortNewestFirst(worker.history);
  const summary = historySummary(items, worker.completedShifts);
  const dist = ratingDistribution(items);
  const quotes = items.filter((i) => i.feedback);

  if (!worker.ratingCount && !dist.total) {
    return (
      <Card>
        <EmptyState icon={Star} title="No reviews yet" description="Employers rate you after each approved shift. Your first review will show up here." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-1">
            <p className="font-display text-[40px] font-semibold leading-none tracking-tight text-navy-900 tabular">{worker.rating.toFixed(1)}</p>
            <div>
              <p className="inline-flex items-center gap-1 text-sm font-medium text-fg"><Star className="size-4 fill-amber-500 text-amber-500" aria-hidden /> out of 5</p>
              <p className="text-[13px] text-fg-muted tabular">{worker.ratingCount} employer ratings</p>
            </div>
          </div>
          <ol className="flex flex-1 flex-col gap-2" aria-label="Rating distribution from recent verified shifts">
            {dist.buckets.map((b) => (
              <li key={b.stars} className="flex items-center gap-3 text-[13px]">
                <span className="w-6 shrink-0 tabular text-fg-muted">{b.stars}★</span>
                <Progress value={b.pct} tone="amber" className="flex-1" label={`${b.stars} star: ${b.count}`} />
                <span className="w-5 shrink-0 text-right tabular text-fg">{b.count}</span>
              </li>
            ))}
          </ol>
        </div>
        {summary.ratedCount ? <p className="mt-4 text-xs text-fg-subtle">Distribution from your {summary.ratedCount} most recent verified shifts. Half stars round down.</p> : null}
      </Card>

      {quotes.length ? (
        <ul className="space-y-3">
          {quotes.map((q, i) => {
            const employer = byId.get(q.employerId);
            return (
              <motion.li key={q.id} {...staggerItem(i)}>
                <Card className="p-4">
                  <blockquote className="text-[15px] leading-6 text-fg">&ldquo;{q.feedback}&rdquo;</blockquote>
                  <footer className="mt-3 flex items-center gap-3 text-[13px] text-fg-muted">
                    {employer ? <EmployerMark employer={employer} size="xs" /> : null}
                    <span className="min-w-0 truncate"><span className="font-medium text-fg">{employer?.name ?? "Employer"}</span> · {ROLES[q.role].short} · {formatDate(q.date)}</span>
                    {typeof q.rating === "number" ? <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-medium tabular text-fg"><Star className="size-3.5 fill-amber-500 text-amber-500" aria-hidden />{q.rating.toFixed(1)}</span> : null}
                  </footer>
                </Card>
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-fg-muted">Employers rated you but didn&rsquo;t leave written feedback yet.</p>
      )}
    </div>
  );
}
