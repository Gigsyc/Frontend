"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button, DataList, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, PayoutStatusBadge } from "@/components/ui";
import { formatDate, formatDayShort, formatRwf, formatTimeRange, shiftHours } from "@/lib/utils";
import type { PayoutItem } from "../types";

interface PayoutDetailDialogProps {
  item: PayoutItem | null;
  onOpenChange: (open: boolean) => void;
}

const STATUS_NOTE = {
  pending: (employer: string) => `Waiting for ${employer} to approve your hours. Most employers approve within 48 hours of the shift.`,
  processing: () => "Approved. The transfer is in progress and usually lands within a few minutes.",
  paid: () => "Sent to your account. Keep the reference if you need to query it with your provider.",
} as const;

/** Everything about one payout: the shift it pays for, the maths and the transfer reference. */
export function PayoutDetailDialog({ item, onOpenChange }: PayoutDetailDialogProps) {
  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        {item ? <Detail item={item} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function Detail({ item }: { item: PayoutItem }) {
  const { payout, shift, employer, booking } = item;
  const hours = shiftHours(shift.startTime, shift.endTime, shift.breakMinutes);
  const employerName = employer?.name ?? "the employer";
  const paid = payout.status === "paid";

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <PayoutStatusBadge status={payout.status} />
        </div>
        <DialogTitle className="mt-1 font-display text-2xl tabular">{formatRwf(payout.amount)}</DialogTitle>
        <DialogDescription>{STATUS_NOTE[payout.status](employerName)}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <DataList
          columns={2}
          items={[
            { label: "Shift", value: shift.title },
            { label: "Employer", value: employerName },
            { label: "Worked", value: <span className="tabular">{formatDate(shift.date)} · {formatTimeRange(shift.startTime, shift.endTime)}</span> },
            { label: "Hours", value: <span className="tabular">{hours}h{shift.breakMinutes ? ` (${shift.breakMinutes} min break)` : ""}</span> },
            { label: "Pay", value: <span className="tabular">{formatRwf(shift.payPerShift)}</span> },
            { label: "Transport", value: shift.transportAllowance ? <span className="tabular">{formatRwf(shift.transportAllowance)}</span> : "Not included" },
            { label: "Method", value: payout.method },
            { label: "Reference", value: <span className="font-mono text-[13px] tabular">{payout.reference}</span> },
            paid
              ? { label: "Paid at", value: <span className="tabular">{formatDate(payout.paidAt ?? payout.scheduledFor)}</span> }
              : { label: "Expected", value: <span className="tabular">{formatDayShort(payout.scheduledFor)}</span> },
            ...(booking?.employerRating ? [{ label: "Their rating of you", value: <span className="tabular">{booking.employerRating.score.toFixed(1)} / 5</span> }] : []),
          ]}
        />
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild><Button variant="ghost">Close</Button></DialogClose>
        <Button asChild variant="outline"><Link href={`/worker/shifts/${shift.id}`}><ExternalLink /> View shift</Link></Button>
      </DialogFooter>
    </>
  );
}
