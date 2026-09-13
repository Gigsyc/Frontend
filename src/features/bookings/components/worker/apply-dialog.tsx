"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox";
import { DataList } from "@/components/ui/data-list";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDayLong, formatRwf, formatTimeRange, shiftHours } from "@/lib/utils";
import type { Booking, Shift } from "@/types";
import { useApplyToShift } from "../../queries";

interface ApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  /** Omitted while the employer is still loading; every use here starts a sentence, so it falls back capitalised. */
  employerName?: string;
  workerId: string;
}

/** Confirm → apply. Talent-pool workers are auto-confirmed by the store, so the success copy adapts to the result. */
export function ApplyDialog({ open, onOpenChange, shift, employerName, workerId }: ApplyDialogProps) {
  const name = employerName ?? "The employer";
  const apply = useApplyToShift();
  const [agreed, setAgreed] = useState(false);
  const [result, setResult] = useState<Booking | null>(null);
  const hours = shiftHours(shift.startTime, shift.endTime, shift.breakMinutes);

  const close = (next: boolean) => {
    if (apply.isPending) return;
    onOpenChange(next);
    if (!next) { setAgreed(false); setResult(null); }
  };

  const submit = () => {
    apply.mutate(
      { shiftId: shift.id, workerId },
      {
        onSuccess: (booking) => {
          setResult(booking);
          if (booking.status === "confirmed") {
            toast.success(`You're confirmed for ${shift.title}`, { description: `${name} has you in their talent pool, so no review needed.` });
          } else {
            toast.success(`Applied to ${shift.title}`, { description: `${name} usually confirms within a day.` });
          }
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "We couldn't send your application. Try again."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent size="sm">
        {result ? (
          <ApplySuccess confirmed={result.status === "confirmed"} employerName={name} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Apply for this shift?</DialogTitle>
              <DialogDescription>{name} will see your profile, rating and reliability.</DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-5">
              <DataList
                columns={2}
                items={[
                  { label: "Shift", value: shift.title },
                  { label: "Pay", value: <span className="font-semibold text-navy-900 tabular">{formatRwf(shift.payPerShift)}</span> },
                  { label: "Date", value: formatDayLong(shift.date) },
                  { label: "Time", value: `${formatTimeRange(shift.startTime, shift.endTime)} · ${hours}h` },
                ]}
              />
              <CheckboxField
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                label="I can work the full shift and arrive 15 minutes early"
                description="No-shows and late arrivals lower your reliability score."
              />
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost" disabled={apply.isPending}>Not now</Button></DialogClose>
              <Button onClick={submit} disabled={!agreed} loading={apply.isPending}>Confirm application</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ApplySuccess({ confirmed, employerName }: { confirmed: boolean; employerName: string }) {
  return (
    <div className="flex flex-col items-center px-6 pb-6 pt-10 text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex size-14 items-center justify-center rounded-full bg-success-50 text-success-600"
      >
        <Check className="size-7" strokeWidth={2.5} aria-hidden />
      </motion.span>
      <DialogTitle className="mt-4">{confirmed ? "You're confirmed!" : "Application sent"}</DialogTitle>
      <DialogDescription className="mt-1">
        {confirmed
          ? `${employerName} has you in their talent pool, so you skipped the queue. The shift is in your schedule.`
          : `${employerName} usually confirms within a day. We'll notify you either way.`}
      </DialogDescription>
      <div className="mt-6 flex w-full flex-col gap-2">
        {confirmed ? <Button asChild><Link href="/worker/schedule">View my schedule</Link></Button> : null}
        <DialogClose asChild><Button variant={confirmed ? "ghost" : "primary"}>Done</Button></DialogClose>
      </div>
    </div>
  );
}
