"use client";

import { motion } from "motion/react";
import { Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { useEmployerBookings } from "@/features/bookings";
import { useWorkers } from "@/features/workers";
import { InviteToShiftDialog } from "@/features/workers/components/employer/invite-to-shift-dialog";
import { staggerItem, useEntranceOnce } from "@/features/workers/components/employer/motion";
import { WorkerGridSkeleton } from "@/features/workers/components/employer/worker-grid";
import { pluralize } from "@/lib/utils";
import type { Worker } from "@/types";
import { useTalentPool, useUpdatePoolNote } from "../queries";
import { PoolNoteDialog } from "./pool-note-dialog";
import { PoolWorkerCard, type PoolItem } from "./pool-worker-card";
import { RemoveFromPoolDialog } from "./remove-from-pool-dialog";
import { useDialogTarget } from "./use-dialog-target";

type PoolSort = "recent" | "rating" | "shifts_with_us";
const SORTS: Array<{ value: PoolSort; label: string }> = [
  { value: "recent", label: "Recently added" },
  { value: "rating", label: "Rating" },
  { value: "shifts_with_us", label: "Most shifts with us" },
];
const isPoolSort = (v: string): v is PoolSort => SORTS.some((s) => s.value === v);

interface Props { employerId: string; onFindWorkers: () => void }

export function TalentPoolTab({ employerId, onFindWorkers }: Props) {
  const pool = useTalentPool(employerId);
  const workers = useWorkers({});
  // Same source of truth as the profile card's "With you" box, so one number never disagrees with itself.
  const bookings = useEmployerBookings(employerId);
  const [sort, setSort] = useState<PoolSort>("recent");
  const updateNote = useUpdatePoolNote(employerId);
  const note = useDialogTarget<PoolItem>();
  const invite = useDialogTarget<Worker>();
  const remove = useDialogTarget<Worker>();

  /** Completed shifts per worker for this employer. Undefined while bookings are unavailable. */
  const completedByWorker = useMemo(() => {
    if (!bookings.data) return undefined;
    const counts = new Map<string, number>();
    for (const b of bookings.data) {
      if (b.status === "completed") counts.set(b.workerId, (counts.get(b.workerId) ?? 0) + 1);
    }
    return counts;
  }, [bookings.data]);

  const items = useMemo<PoolItem[] | undefined>(() => {
    if (!pool.data || !workers.data) return undefined;
    const byId = new Map(workers.data.map((w) => [w.id, w]));
    const joined = pool.data.flatMap((entry) => {
      const worker = byId.get(entry.workerId);
      if (!worker) return [];
      return [{
        worker,
        entry,
        note: entry.note ?? "",
        shiftsWithUs: completedByWorker ? completedByWorker.get(worker.id) ?? 0 : undefined,
      }];
    });
    return joined.sort((a, b) => {
      if (sort === "rating") return b.worker.rating - a.worker.rating || b.worker.ratingCount - a.worker.ratingCount;
      if (sort === "shifts_with_us") return (b.shiftsWithUs ?? 0) - (a.shiftsWithUs ?? 0) || b.worker.completedShifts - a.worker.completedShifts;
      return b.entry.addedAt.localeCompare(a.entry.addedAt);
    });
  }, [pool.data, workers.data, completedByWorker, sort]);

  const animate = useEntranceOnce(!!items);

  const saveNote = (workerId: string, firstName: string, text: string) => {
    updateNote.mutate(
      { workerId, note: text },
      {
        onSuccess: () => {
          note.close();
          toast.success(text ? `Note about ${firstName} saved` : `Note about ${firstName} deleted`, {
            description: "Notes are private to your team.",
          });
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "We couldn't save the note. Try again."),
      },
    );
  };

  if (pool.isPending || workers.isPending || bookings.isPending) return <WorkerGridSkeleton count={4} withToolbar />;

  if (pool.isError || workers.isError || !items) {
    return (
      <div className="rounded-lg bg-surface shadow-card">
        <ErrorState
          title="We couldn't load your talent pool"
          error={pool.error ?? workers.error}
          onRetry={() => { if (pool.isError) void pool.refetch(); if (workers.isError) void workers.refetch(); }}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg bg-surface shadow-card">
        <EmptyState
          icon={Star}
          title="Your talent pool is empty"
          description="Add professionals you'd hire again. Pool members are confirmed automatically when they apply to your shifts, and you can invite them directly."
          action={<Button onClick={onFindWorkers}><Search /> Find workers</Button>}
        />
      </div>
    );
  }

  const noteTarget = note.target;
  const inviteTarget = invite.target;
  const removeTarget = remove.target;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-fg-muted">
          <span className="tabular font-medium text-fg">{pluralize(items.length, "professional")}</span> in your pool · confirmed automatically when they apply
        </p>
        <Field label="Sort by" className="w-full sm:w-48">
          {(p) => (
            <Select {...p} value={sort} onChange={(e) => setSort(isPoolSort(e.target.value) ? e.target.value : "recent")}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          )}
        </Field>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((item, i) => (
          <motion.li key={item.worker.id} layout {...staggerItem(i, animate)}>
            <PoolWorkerCard
              item={item}
              onEditNote={() => note.show(item)}
              onInvite={() => invite.show(item.worker)}
              onRemove={() => remove.show(item.worker)}
            />
          </motion.li>
        ))}
      </ul>

      {/* Targets outlive closing so Radix can animate the dialogs out. */}
      {noteTarget ? (
        <PoolNoteDialog
          key={noteTarget.worker.id}
          worker={noteTarget.worker}
          note={noteTarget.note}
          open={note.open}
          saving={updateNote.isPending}
          onOpenChange={note.onOpenChange}
          onSave={(text) => saveNote(noteTarget.worker.id, noteTarget.worker.firstName, text)}
        />
      ) : null}
      {inviteTarget ? (
        <InviteToShiftDialog key={inviteTarget.id} employerId={employerId} worker={inviteTarget} open={invite.open} onOpenChange={invite.onOpenChange} />
      ) : null}
      {removeTarget ? (
        <RemoveFromPoolDialog key={removeTarget.id} employerId={employerId} worker={removeTarget} open={remove.open} onOpenChange={remove.onOpenChange} />
      ) : null}
    </div>
  );
}
