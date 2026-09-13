"use client";

import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { WorkerCard, WorkerCardSkeleton } from "@/components/common";
import { EmptyState, ErrorState, SectionHeading } from "@/components/ui";
import { useShiftCandidates } from "@/features/shifts";
import type { Shift } from "@/types";
import { InviteButton } from "./invite-button";

interface SuggestedCandidatesProps {
  shift: Shift;
  excludeIds: ReadonlySet<string>;
  poolIds: ReadonlySet<string>;
  canInvite: boolean;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Top matches from the ranking, minus anyone already on the shift. */
export function SuggestedCandidates({ shift, excludeIds, poolIds, canInvite }: SuggestedCandidatesProps) {
  const candidates = useShiftCandidates(shift.id);
  const top = (candidates.data ?? []).filter((c) => !excludeIds.has(c.worker.id)).slice(0, 6);

  return (
    <section className="space-y-4">
      <SectionHeading
        title="Suggested for this shift"
        description="Ranked on skill match, distance, reliability and who's worked with you before."
      />
      {candidates.isPending ? (
        <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <WorkerCardSkeleton key={i} />)}</div>
      ) : candidates.isError ? (
        <ErrorState compact title="We couldn't rank workers" error={candidates.error} onRetry={() => void candidates.refetch()} retrying={candidates.isRefetching} />
      ) : top.length === 0 ? (
        <EmptyState compact icon={Sparkles} title="Everyone we'd suggest is already on this shift" description="Open the invite drawer to browse the full list." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {top.map((c, i) => (
            <motion.li key={c.worker.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE, delay: Math.min(i, 8) * 0.03 }}>
              <WorkerCard
                worker={c.worker}
                href={`/employer/talent/${c.worker.id}`}
                reasons={c.reasons}
                inPool={poolIds.has(c.worker.id)}
                action={
                  <>
                    {canInvite ? <InviteButton shiftId={shift.id} shiftTitle={shift.title} worker={c.worker} /> : null}
                    <span className="ml-auto text-xs text-fg-muted tabular">{c.score}% match</span>
                  </>
                }
              />
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
