"use client";

import { motion } from "motion/react";
import { Send, UserSearch, X } from "lucide-react";
import { useMemo } from "react";
import { WorkerCard } from "@/components/common/worker-card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useWorkers } from "@/features/workers";
import { InviteToShiftDialog } from "@/features/workers/components/employer/invite-to-shift-dialog";
import { staggerItem, useEntranceOnce } from "@/features/workers/components/employer/motion";
import { useWorkerFilterParams } from "@/features/workers/components/employer/use-worker-filter-params";
import { WorkerFilterBar } from "@/features/workers/components/employer/worker-filter-bar";
import { WorkerGridSkeleton } from "@/features/workers/components/employer/worker-grid";
import { pluralize } from "@/lib/utils";
import type { Worker } from "@/types";
import { useTalentPool } from "../queries";
import { PoolToggleButton } from "./pool-toggle-button";
import { useDialogTarget } from "./use-dialog-target";

export function FindWorkersTab({ employerId }: { employerId: string }) {
  const { state, filters, update, clear, activeCount } = useWorkerFilterParams();
  const workers = useWorkers(filters);
  const pool = useTalentPool(employerId);
  const poolIds = useMemo(() => new Set(pool.data?.map((e) => e.workerId) ?? []), [pool.data]);
  const invite = useDialogTarget<Worker>();
  const animate = useEntranceOnce(!!workers.data);
  const inviteTarget = invite.target;

  return (
    <div className="space-y-5">
      <WorkerFilterBar state={state} activeCount={activeCount} onChange={update} onClear={clear} />

      {workers.isPending ? (
        <WorkerGridSkeleton count={6} />
      ) : workers.isError || !workers.data ? (
        <div className="rounded-lg bg-surface shadow-card">
          <ErrorState title="We couldn't load professionals" error={workers.error} onRetry={() => void workers.refetch()} />
        </div>
      ) : workers.data.length === 0 ? (
        <div className="rounded-lg bg-surface shadow-card">
          <EmptyState
            icon={UserSearch}
            title={activeCount ? "No one matches these filters" : "No professionals yet"}
            description={activeCount ? "Try fewer roles, a wider area or a lower minimum rating." : "Verified professionals appear here as they join GigSyc."}
            action={activeCount ? <Button variant="outline" onClick={clear}><X /> Clear filters</Button> : undefined}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-fg-muted" aria-live="polite">
            <span className="tabular font-medium text-fg">{pluralize(workers.data.length, "professional")}</span>
            {activeCount ? <span>match your filters</span> : <span>on GigSyc</span>}
            {workers.isFetching ? <Spinner label="Updating results" /> : null}
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {workers.data.map((worker, i) => {
              const inPool = poolIds.has(worker.id);
              return (
                <motion.li key={worker.id} layout {...staggerItem(i, animate)}>
                  <WorkerCard
                    worker={worker}
                    href={`/employer/talent/${worker.id}`}
                    inPool={inPool}
                    action={
                      <>
                        <PoolToggleButton employerId={employerId} worker={worker} inPool={inPool} className="h-11 sm:h-8" />
                        <Button size="sm" variant="ghost" className="ml-auto h-11 sm:h-8" onClick={() => invite.show(worker)}><Send /> Invite</Button>
                      </>
                    }
                  />
                </motion.li>
              );
            })}
          </ul>
        </>
      )}

      {/* The target outlives closing so Radix can animate the dialog out. */}
      {inviteTarget ? (
        <InviteToShiftDialog key={inviteTarget.id} employerId={employerId} worker={inviteTarget} open={invite.open} onOpenChange={invite.onOpenChange} />
      ) : null}
    </div>
  );
}
