"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Spinner } from "@/components/ui";
import { useCheckIn } from "@/features/bookings";
import { cn } from "@/lib/utils";
import { employerShortName, formatClock } from "../lib";
import type { ScheduleItem } from "../types";

type Phase = "scanning" | "confirming" | "done" | "failed";

const EASE = [0.22, 1, 0.36, 1] as const;
const CORNERS = [
  "left-3 top-3 rounded-tl-md border-l-2 border-t-2",
  "right-3 top-3 rounded-tr-md border-r-2 border-t-2",
  "bottom-3 left-3 rounded-bl-md border-b-2 border-l-2",
  "bottom-3 right-3 rounded-br-md border-b-2 border-r-2",
];

interface CheckInDialogProps {
  item: ScheduleItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckInDialog({ item, open, onOpenChange }: CheckInDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        {/* Rendered only while open so the flow restarts from "scanning" every time. */}
        {open ? <CheckInFlow item={item} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function CheckInFlow({ item }: { item: ScheduleItem }) {
  const [phase, setPhase] = useState<Phase>("scanning");
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const { mutate } = useCheckIn();
  const short = employerShortName(item.employer?.name);
  const supervisor = item.shift.supervisor;

  useEffect(() => {
    if (phase !== "scanning") return;
    // The "camera" finds the code after a beat, then we confirm with the store.
    const timer = setTimeout(() => {
      setPhase("confirming");
      mutate(item.booking.id, {
        onSuccess: (booking) => {
          const at = booking.checkInAt ? formatClock(booking.checkInAt) : null;
          setCheckedInAt(at);
          setPhase("done");
          toast.success(at ? `Checked in at ${at}` : "Checked in", { description: `${short} can see you've arrived.` });
        },
        onError: (err) => {
          setPhase("failed");
          toast.error(err.message);
        },
      });
    }, 1600);
    return () => clearTimeout(timer);
  }, [phase, mutate, item.booking.id, short]);

  const askSupervisor = () =>
    toast(`We've let ${supervisor.name} know you're here`, { description: "They can confirm your check-in from the supervisor view." });

  if (phase === "done") {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Checked in</DialogTitle>
          <DialogDescription className="sr-only">Your check-in for {item.shift.title} is confirmed.</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col items-center py-8 text-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="inline-flex size-20 items-center justify-center rounded-full bg-success-50 text-success-600"
          >
            <Check className="size-10" strokeWidth={3} aria-hidden />
          </motion.span>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15, ease: EASE }}>
            <p className="mt-5 font-display text-xl font-semibold text-navy-900">You&apos;re checked in{checkedInAt ? <> · <span className="tabular">{checkedInAt}</span></> : null}</p>
            <p className="mt-1 text-sm text-fg-muted">Have a great shift.</p>
          </motion.div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button className="w-full sm:w-auto">Close</Button></DialogClose>
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Scan the QR at the staff entrance</DialogTitle>
        <DialogDescription>{supervisor.name} has the code on the {short} tablet. Hold it inside the frame.</DialogDescription>
      </DialogHeader>
      <DialogBody className="flex flex-col items-center gap-4">
        <Viewfinder scanning={phase === "scanning"} />
        <p className="flex min-h-5 items-center gap-2 text-sm text-fg-muted" role="status">
          {phase === "scanning" ? "Looking for the code…" : null}
          {phase === "confirming" ? <><Spinner /> Code found · confirming with {short}…</> : null}
          {phase === "failed" ? <span className="text-danger-600">We couldn&apos;t confirm your check-in.</span> : null}
        </p>
        {phase === "failed" ? (
          <Button variant="outline" onClick={() => setPhase("scanning")}>Scan again</Button>
        ) : null}
        <button type="button" onClick={askSupervisor} className="min-h-11 text-sm font-medium text-navy-700 underline-offset-4 hover:underline">
          Can&apos;t scan? Ask your supervisor to confirm
        </button>
      </DialogBody>
    </>
  );
}

/** Fake camera viewport. The scan line is the only looping motion in the product — it is the camera metaphor. */
function Viewfinder({ scanning }: { scanning: boolean }) {
  const reduceMotion = useReducedMotion();
  const loop = scanning && !reduceMotion;
  return (
    <div className="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-lg bg-navy-950" role="img" aria-label="Camera viewfinder">
      {CORNERS.map((c) => <span key={c} className={cn("absolute size-8 border-amber-400", c)} aria-hidden />)}
      <QrCode className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 text-white/10" aria-hidden />
      <motion.span
        aria-hidden
        className="absolute inset-x-6 h-0.5 rounded-full bg-amber-400"
        initial={{ top: "14%" }}
        animate={loop ? { top: ["14%", "86%", "14%"] } : { top: "50%" }}
        transition={loop ? { duration: 1.2, repeat: Infinity, ease: "linear" } : { duration: 0.3, ease: EASE }}
      />
    </div>
  );
}
