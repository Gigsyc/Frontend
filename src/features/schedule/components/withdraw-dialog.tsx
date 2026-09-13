"use client";

import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui";
import { useWithdrawBooking } from "@/features/bookings";
import { formatRelativeDay, formatTimeRange } from "@/lib/utils";
import { employerShortName, hoursUntilStart } from "../lib";
import type { ScheduleItem } from "../types";

interface WithdrawDialogProps {
  item: ScheduleItem | null;
  onOpenChange: (open: boolean) => void;
  /** Worker's current reliability, if loaded — makes the warning concrete. */
  reliability?: number;
}

/** Confirm before a worker pulls out of an application or a confirmed shift. */
export function WithdrawDialog({ item, onOpenChange, reliability }: WithdrawDialogProps) {
  const withdraw = useWithdrawBooking();

  const confirm = () => {
    if (!item) return;
    const short = employerShortName(item.employer?.name);
    withdraw.mutate(item.booking.id, {
      onSuccess: () => {
        toast.success(`Withdrawn from ${item.shift.title}`, { description: `${short} has been told and the spot is open again.` });
        onOpenChange(false);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const confirmed = item?.booking.status === "confirmed";
  const hoursLeft = item ? hoursUntilStart(item.shift) : Infinity;
  const late = confirmed && hoursLeft < 24;
  const short = employerShortName(item?.employer?.name);

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        {item ? (
          <>
            <DialogHeader>
              <DialogTitle>{confirmed ? "Withdraw from this shift?" : "Withdraw your application?"}</DialogTitle>
              <DialogDescription>
                {item.shift.title} · {formatRelativeDay(item.shift.date)}, {formatTimeRange(item.shift.startTime, item.shift.endTime)}
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-3 text-sm">
              {late ? (
                <div role="alert" className="flex gap-3 rounded-md bg-warning-50 p-3 text-warning-700">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <p>
                    This shift starts in {hoursLeft < 1 ? "under an hour" : `${Math.max(1, Math.round(hoursLeft))} hours`}. Withdrawing inside 24 hours counts against your reliability
                    {typeof reliability === "number" ? <> (currently <span className="font-semibold tabular">{reliability}%</span>)</> : null}, and {short} has to find a replacement at short notice.
                  </p>
                </div>
              ) : confirmed ? (
                <p className="text-fg-muted">{short} will be notified and the spot reopens. Withdrawing more than 24 hours ahead doesn&apos;t affect your reliability.</p>
              ) : (
                <p className="text-fg-muted">{short} won&apos;t see your application any more. You can apply again while the shift is open.</p>
              )}
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost" disabled={withdraw.isPending}>Keep it</Button></DialogClose>
              <Button variant={late ? "danger" : "danger-soft"} onClick={confirm} loading={withdraw.isPending}>
                {confirmed ? "Withdraw from shift" : "Withdraw application"}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
