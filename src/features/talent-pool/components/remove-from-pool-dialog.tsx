"use client";

import { UserMinus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Worker } from "@/types";
import { useToggleTalentPool } from "../queries";

interface Props {
  employerId: string;
  worker: Pick<Worker, "id" | "firstName" | "lastName">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoved?: () => void;
}

/** Confirm before dropping someone from the pool — it also deletes the private note. */
export function RemoveFromPoolDialog({ employerId, worker, open, onOpenChange, onRemoved }: Props) {
  const toggle = useToggleTalentPool(employerId);

  const remove = () =>
    toggle.mutate(
      { workerId: worker.id },
      {
        onSuccess: (res) => {
          if (res.inPool) {
            // The pool changed underneath us (worker wasn't in it any more) — the toggle re-added them.
            toast.success(`${worker.firstName} added to your talent pool`);
          } else {
            toast.success(`${worker.firstName} removed from your talent pool`, {
              description: "They can still apply to your shifts, but won’t be confirmed automatically.",
            });
          }
          onOpenChange(false);
          onRemoved?.();
        },
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <Dialog open={open} onOpenChange={(o) => !toggle.isPending && onOpenChange(o)}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Remove {worker.firstName} {worker.lastName} from your talent pool?</DialogTitle>
          <DialogDescription>
            They’ll no longer be confirmed automatically when they apply, and your private note will be deleted. You can add them back any time.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={toggle.isPending}>Keep in pool</Button>
          <Button variant="danger" onClick={remove} loading={toggle.isPending}><UserMinus /> Remove</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
