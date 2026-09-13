"use client";

import { MessageSquareText, Pencil, Send, UserMinus } from "lucide-react";
import { WorkerCard } from "@/components/common/worker-card";
import { Button } from "@/components/ui/button";
import { formatTimeAgo, pluralize } from "@/lib/utils";
import type { TalentPoolEntry, Worker } from "@/types";

export interface PoolItem {
  worker: Worker;
  entry: TalentPoolEntry;
  /** Effective note: local edit if any, else what the pool entry carries. */
  note: string;
  /** Shifts this worker completed for this employer, from the employer's own bookings. Undefined when bookings failed to load. */
  shiftsWithUs?: number;
}

interface Props {
  item: PoolItem;
  onEditNote: () => void;
  onInvite: () => void;
  onRemove: () => void;
}

/** A talent-pool member: WorkerCard plus the team's private note and pool actions. */
export function PoolWorkerCard({ item, onEditNote, onInvite, onRemove }: Props) {
  const { worker, entry, note, shiftsWithUs } = item;
  return (
    <WorkerCard
      worker={worker}
      href={`/employer/talent/${worker.id}`}
      inPool
      action={
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-start gap-2">
            <MessageSquareText className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden />
            {note ? (
              <p className="min-w-0 flex-1 text-[13px] leading-5 text-fg">{note}</p>
            ) : (
              <p className="min-w-0 flex-1 text-[13px] leading-5 text-fg-subtle">No note yet — jot down why they’re in your pool.</p>
            )}
            {/* Negative margins keep the 44px mobile / 32px desktop target centred on the first text line. */}
            <Button variant="ghost" size="sm" className="-my-3 h-11 shrink-0 sm:-my-1.5 sm:h-8" onClick={onEditNote} aria-label={note ? `Edit note about ${worker.firstName}` : `Add a note about ${worker.firstName}`}>
              <Pencil /> {note ? "Edit" : "Add note"}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-auto text-xs text-fg-muted">
              {typeof shiftsWithUs === "number" ? (
                <><span className="tabular font-medium text-fg">{pluralize(shiftsWithUs, "shift")}</span> with you · </>
              ) : null}
              added {formatTimeAgo(entry.addedAt)}
            </p>
            <Button variant="ghost" size="sm" className="h-11 sm:h-8" onClick={onRemove}>
              <UserMinus /> Remove
            </Button>
            <Button size="sm" className="h-11 sm:h-8" onClick={onInvite}><Send /> Invite to shift</Button>
          </div>
        </div>
      }
    />
  );
}
