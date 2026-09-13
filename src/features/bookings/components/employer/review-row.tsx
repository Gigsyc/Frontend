"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Input, StarInput, WorkerAvatar } from "@/components/ui";
import { useApproveBooking } from "@/features/bookings";
import { formatRwf } from "@/lib/utils";
import type { Booking, Shift } from "@/types";
import type { StaffingRow } from "./use-shift-staffing";

type EmployerRating = NonNullable<Booking["employerRating"]>;

interface ReviewRowProps {
  row: StaffingRow;
  shift: Shift;
  index: number;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SUB: Array<{ key: keyof Pick<EmployerRating, "punctuality" | "professionalism" | "competence">; label: string }> = [
  { key: "punctuality", label: "Punctuality" },
  { key: "professionalism", label: "Professionalism" },
  { key: "competence", label: "Competence" },
];

export function payoutFor(shift: Shift) {
  return shift.payPerShift + (shift.transportAllowance ?? 0);
}

/** One worker awaiting approval: overall stars drive the three sub-scores until they're set individually. */
export function ReviewRow({ row, shift, index }: ReviewRowProps) {
  const approve = useApproveBooking();
  const [score, setScore] = useState(0);
  const [subs, setSubs] = useState<Partial<Record<keyof EmployerRating, number>>>({});
  const [note, setNote] = useState("");
  const { worker, booking } = row;

  const sub = (k: keyof EmployerRating) => subs[k] ?? score;

  const submit = () => {
    if (!score) return;
    const rating: EmployerRating = { score, punctuality: sub("punctuality"), professionalism: sub("professionalism"), competence: sub("competence"), note: note.trim() || undefined };
    approve.mutate(
      { bookingId: booking.id, rating },
      {
        onSuccess: () => toast.success("Approved", { description: `${formatRwf(payoutFor(shift))} released to ${worker.firstName}.` }),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't approve. Try again."),
      },
    );
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: EASE, delay: Math.min(index, 8) * 0.03 }}
      className="rounded-lg bg-surface p-4 shadow-card sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3 lg:w-64 lg:shrink-0">
          <Link href={`/employer/talent/${worker.id}`} className="shrink-0 rounded-full"><WorkerAvatar worker={worker} size="md" /></Link>
          <div className="min-w-0">
            <Link href={`/employer/talent/${worker.id}`} className="text-sm font-semibold text-fg hover:text-navy-800">{worker.firstName} {worker.lastName}</Link>
            <p className="truncate text-xs text-fg-muted">{worker.headline}</p>
            <p className="mt-1 text-xs text-fg-muted">Pays <span className="font-semibold text-fg tabular">{formatRwf(payoutFor(shift))}</span> on approval</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-fg-muted">Overall</span>
            <StarInput value={score} onChange={(v) => setScore(v)} label={`Overall rating for ${worker.firstName}`} size="lg" disabled={approve.isPending} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {SUB.map((s) => (
              <div key={s.key} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-fg-muted">{s.label}</span>
                <StarInput value={sub(s.key)} onChange={(v) => setSubs((p) => ({ ...p, [s.key]: v }))} label={`${s.label} for ${worker.firstName}`} disabled={approve.isPending || !score} />
              </div>
            ))}
          </div>
          <Input aria-label={`Note for ${worker.firstName}`} placeholder="Optional note — workers see this on their profile" value={note} onChange={(e) => setNote(e.target.value)} maxLength={160} disabled={approve.isPending} />
        </div>

        <div className="flex lg:w-40 lg:shrink-0 lg:justify-end">
          <Button onClick={submit} loading={approve.isPending} disabled={!score} className="h-11 w-full lg:w-auto">
            <CheckCircle2 /> {score ? "Approve & pay" : "Rate to approve"}
          </Button>
        </div>
      </div>
    </motion.li>
  );
}
