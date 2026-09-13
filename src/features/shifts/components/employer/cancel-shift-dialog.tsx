"use client";

import { toast } from "sonner";
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui";
import { useCancelShift, useDeleteShift } from "@/features/shifts";
import { formatDayShort, pluralize } from "@/lib/utils";
import type { Shift } from "@/types";
import { errorMessage } from "./shift-helpers";

interface CancelShiftDialogProps {
  /** Pass the shift to open the dialog; null closes it. */
  shift: Shift | null;
  onClose: () => void;
  /** Confirmed + applied + invited workers who will hear about it. */
  affected?: number;
  onCancelled?: (shift: Shift) => void;
}

/**
 * Two jobs, one dialog. A draft was never published, so discarding deletes it outright.
 * A posted shift is cancelled — workers are told and the record stays under Cancelled.
 */
export function CancelShiftDialog({ shift, onClose, affected, onCancelled }: CancelShiftDialogProps) {
  const cancel = useCancelShift();
  const remove = useDeleteShift();
  const isDraft = shift?.status === "draft";
  const pending = cancel.isPending || remove.isPending;

  const confirm = () => {
    if (!shift) return;
    const handlers = {
      onSuccess: () => {
        toast.success(isDraft ? "Draft discarded" : "Shift cancelled", {
          description: isDraft
            ? "Nothing was posted, so no workers were told."
            : typeof affected === "number" && affected > 0
              ? `${pluralize(affected, "worker")} on this shift will be notified now.`
              : "Anyone attached to this shift has been notified.",
        });
        onCancelled?.(shift);
        onClose();
      },
      onError: (err: unknown) => toast.error(errorMessage(err)),
    };
    if (isDraft) remove.mutate(shift.id, handlers);
    else cancel.mutate(shift.id, handlers);
  };

  return (
    <Dialog open={!!shift} onOpenChange={(open) => { if (!open && !pending) onClose(); }}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{isDraft ? "Discard this draft?" : "Cancel this shift?"}</DialogTitle>
          <DialogDescription>
            {shift ? (
              <>
                <span className="font-medium text-fg">{shift.title}</span> on {formatDayShort(shift.date)}.{" "}
                {isDraft
                  ? "The draft will be deleted from your list. This can't be undone."
                  : "Confirmed and applied workers will be told the shift is off. It stays in your list under Cancelled. This can't be undone."}
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>{isDraft ? "Keep draft" : "Keep shift"}</Button>
          </DialogClose>
          <Button variant="danger" onClick={confirm} loading={pending}>
            {isDraft ? "Discard draft" : "Cancel shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
