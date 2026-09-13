"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button, DataList, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui";
import { useCheckOut } from "@/features/bookings";
import { formatRwf, formatTimeRange, shiftHours } from "@/lib/utils";
import { employerShortName, formatClock } from "../lib";
import type { ScheduleItem } from "../types";
import { RateEmployerForm } from "./rate-employer-form";

interface CheckOutDialogProps {
  item: ScheduleItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckOutDialog({ item, open, onOpenChange }: CheckOutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        {open ? <CheckOutFlow item={item} onClose={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function CheckOutFlow({ item, onClose }: { item: ScheduleItem; onClose: () => void }) {
  const [done, setDone] = useState(false);
  const [checkedOutAt, setCheckedOutAt] = useState<string | null>(null);
  const checkOut = useCheckOut();
  const { shift, booking } = item;
  const short = employerShortName(item.employer?.name);
  const hours = shiftHours(shift.startTime, shift.endTime, shift.breakMinutes);
  const total = shift.payPerShift + (shift.transportAllowance ?? 0);

  const confirm = () =>
    checkOut.mutate(booking.id, {
      onSuccess: (b) => {
        setCheckedOutAt(b.checkOutAt ? formatClock(b.checkOutAt) : null);
        setDone(true);
        toast.success("Checked out — shift complete", { description: `${short} approves your hours, then ${formatRwf(total)} goes to your MoMo.` });
      },
      onError: (err) => toast.error(err.message),
    });

  if (done) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Shift complete</DialogTitle>
          <DialogDescription className="sr-only">You have checked out of {shift.title}.</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-600"
            >
              <Check className="size-7" strokeWidth={3} aria-hidden />
            </motion.span>
            <div>
              <p className="font-display text-lg font-semibold leading-tight text-navy-900">
                <span className="tabular">{hours}h</span> on shift{checkedOutAt ? <span className="text-fg-muted"> · out at <span className="tabular">{checkedOutAt}</span></span> : null}
              </p>
              <p className="mt-1 text-sm text-fg-muted">
                <span className="font-semibold text-fg tabular">{formatRwf(total)}</span> will be paid after {short} approves, usually within 48h.
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-5">
            <RateEmployerForm item={item} onDone={onClose} dismissLabel="Skip for now" />
          </div>
        </DialogBody>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Check out of {shift.title}?</DialogTitle>
        <DialogDescription>This ends your shift and sends your hours to {short} for approval.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <DataList
          columns={2}
          items={[
            { label: "Checked in", value: <span className="tabular">{booking.checkInAt ? formatClock(booking.checkInAt) : "—"}</span> },
            { label: "Scheduled", value: <span className="tabular">{formatTimeRange(shift.startTime, shift.endTime)} · {hours}h</span> },
            { label: "Pay", value: <span className="font-semibold tabular">{formatRwf(shift.payPerShift)}</span> },
            { label: "Transport", value: shift.transportAllowance ? <span className="tabular">{formatRwf(shift.transportAllowance)}</span> : "Not included" },
          ]}
        />
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild><Button variant="ghost" disabled={checkOut.isPending}>Not yet</Button></DialogClose>
        <Button onClick={confirm} loading={checkOut.isPending}>Check out</Button>
      </DialogFooter>
    </>
  );
}
