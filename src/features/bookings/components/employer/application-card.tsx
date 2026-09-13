"use client";

import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { WorkerCard } from "@/components/common";
import { Button, Tooltip } from "@/components/ui";
import { useConfirmBooking, useDeclineBooking } from "@/features/bookings";
import { formatTimeAgo } from "@/lib/utils";
import type { Shift } from "@/types";
import type { StaffingRow } from "./use-shift-staffing";

interface ApplicationCardProps {
  row: StaffingRow;
  shift: Shift;
  full: boolean;
  reasons?: string[];
  index: number;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ApplicationCard({ row, shift, full, reasons, index }: ApplicationCardProps) {
  const confirm = useConfirmBooking();
  const decline = useDeclineBooking();
  const { worker, booking } = row;
  const name = `${worker.firstName} ${worker.lastName}`;

  const onConfirm = () =>
    confirm.mutate(booking.id, {
      onSuccess: () => toast.success(`${worker.firstName} is confirmed`, { description: `${shift.title} · we've let them know.` }),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't confirm. Try again."),
    });
  const onDecline = () =>
    decline.mutate(booking.id, {
      onSuccess: () => toast.success(`Declined ${worker.firstName}'s application`),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't decline. Try again."),
    });

  const busy = confirm.isPending || decline.isPending;
  const confirmBtn = (
    <Button size="sm" onClick={onConfirm} loading={confirm.isPending} disabled={full || busy} aria-label={`Confirm ${name}`}>
      <Check /> Confirm
    </Button>
  );

  return (
    <motion.li layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3, ease: EASE, delay: Math.min(index, 8) * 0.03 }}>
      <WorkerCard
        worker={worker}
        href={`/employer/talent/${worker.id}`}
        reasons={reasons}
        action={
          <>
            {full ? (
              <Tooltip content="All positions are filled. Increase the headcount or remove someone to confirm more.">
                <span className="inline-flex">{confirmBtn}</span>
              </Tooltip>
            ) : confirmBtn}
            <Button size="sm" variant="ghost" onClick={onDecline} loading={decline.isPending} disabled={busy} aria-label={`Decline ${name}`}>
              <X /> Decline
            </Button>
            <span className="ml-auto text-xs text-fg-muted">Applied {formatTimeAgo(booking.createdAt)}</span>
          </>
        }
      />
    </motion.li>
  );
}
