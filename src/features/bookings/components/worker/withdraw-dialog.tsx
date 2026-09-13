"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { BookingStatus } from "@/types";
import { useWithdrawBooking } from "../../queries";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  status: Extract<BookingStatus, "applied" | "confirmed">;
  shiftTitle: string;
  /** Omitted while the employer is still loading — `name` reads mid-sentence, `nameLead` opens a sentence. */
  employerName?: string;
}

/** Destructive confirm for pulling out of a shift. Withdrawing a confirmed place is called out harder. */
export function WithdrawDialog({ open, onOpenChange, bookingId, status, shiftTitle, employerName }: WithdrawDialogProps) {
  const withdraw = useWithdrawBooking();
  const confirmed = status === "confirmed";
  const name = employerName ?? "the employer";
  const nameLead = employerName ?? "The employer";

  const submit = () => {
    withdraw.mutate(bookingId, {
      onSuccess: () => {
        toast.success(confirmed ? "You've left this shift" : "Application withdrawn", {
          description: confirmed ? `${nameLead} has been told and will look for a replacement.` : "You can apply again while the shift is open.",
        });
        onOpenChange(false);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "We couldn't withdraw right now. Try again."),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !withdraw.isPending && onOpenChange(v)}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{confirmed ? "Leave this shift?" : "Withdraw your application?"}</DialogTitle>
          <DialogDescription>{shiftTitle}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-fg-muted">
            {confirmed
              ? `You're confirmed, so ${name} is counting on you. Cancelling a confirmed shift lowers your reliability score.`
              : `${nameLead} won't see your application any more. Nothing changes on your profile.`}
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost" disabled={withdraw.isPending}>Keep it</Button></DialogClose>
          <Button variant="danger" onClick={submit} loading={withdraw.isPending}>{confirmed ? "Leave shift" : "Withdraw"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
