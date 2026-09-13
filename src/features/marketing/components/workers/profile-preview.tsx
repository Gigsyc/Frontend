"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import { WorkerCard, WorkerCardSkeleton } from "@/components/common/worker-card";
import { EmployerMark } from "@/components/ui/avatar";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Rating } from "@/components/ui/rating";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployers } from "@/features/employers";
import { useWorkerSession } from "@/features/session";
import { useWorker } from "@/features/workers";
import { formatDate } from "@/lib/utils";

/** The demo worker's real profile card and the last few rated shifts. */
export function ProfilePreview() {
  const { workerId } = useWorkerSession();
  const worker = useWorker(workerId);
  const employers = useEmployers();
  const byId = new Map(employers.data?.map((e) => [e.id, e]) ?? []);

  if (worker.isError || employers.isError) {
    return (
      <div className="rounded-lg bg-surface p-5 shadow-card">
        <ErrorState compact title="Couldn't load this profile" error={worker.error ?? employers.error} onRetry={() => { void worker.refetch(); void employers.refetch(); }} retrying={worker.isRefetching || employers.isRefetching} />
      </div>
    );
  }

  if (worker.isPending || employers.isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy>
        <WorkerCardSkeleton />
        <div className="rounded-lg bg-surface p-4 shadow-card">
          {[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-3 py-2.5"><Skeleton className="size-8 rounded-md" /><div className="flex-1"><Skeleton className="h-3.5 w-1/2" /><Skeleton className="mt-2 h-3 w-1/3" /></div><Skeleton className="h-4 w-10" /></div>)}
        </div>
      </div>
    );
  }

  const w = worker.data;
  const rated = w.history.filter((h) => typeof h.rating === "number").slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-4">
      <WorkerCard worker={w} href="/login?as=worker" />
      <div className="rounded-lg bg-surface p-4 shadow-card">
        <h3 className="text-sm font-semibold">Recent ratings</h3>
        {rated.length === 0 ? (
          <EmptyState compact icon={Star} title="No rated shifts yet" description="Ratings appear after an employer approves a completed shift." />
        ) : (
          <ul className="mt-1 divide-y divide-border">
            {rated.map((h) => {
              const emp = byId.get(h.employerId);
              return (
                <li key={h.id} className="flex items-start gap-3 py-3">
                  {emp ? <EmployerMark employer={emp} size="sm" /> : <span className="size-8 rounded-md bg-ink-100" aria-hidden />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">{h.title}</p>
                    <p className="text-xs text-fg-muted">{emp?.name ?? "Employer"} · {formatDate(h.date)} · <span className="tabular">{h.hours}h</span></p>
                    {h.feedback ? <p className="mt-1 text-[13px] leading-5 text-fg">“{h.feedback}”</p> : null}
                  </div>
                  <Rating value={h.rating ?? 0} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
