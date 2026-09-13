"use client";

import { CalendarPlus, Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { eventDateLabel } from "@/components/common";
import { Button } from "@/components/ui/button";
import { DataList } from "@/components/ui/data-list";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn, formatRwf, formatTimeRange } from "@/lib/utils";
import type { Event } from "@/types";
import { useAttendEvent } from "../../queries";
import { cheapestTier, fullDateLabel } from "./utils";

interface AttendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onAttended: () => void;
}

const TITLE: Record<Event["attendanceMode"], string> = {
  tickets: "Get tickets",
  register: "Register for this event",
  free: "Confirm you're going",
};

const CONFIRM: Record<Event["attendanceMode"], string> = {
  tickets: "Get tickets",
  register: "Complete registration",
  free: "Yes, I'm going",
};

/** Confirm → attend. One dialog serves all three attendance modes so the copy stays in one place. */
export function AttendDialog({ open, onOpenChange, event, onAttended }: AttendDialogProps) {
  const attend = useAttendEvent();
  const [tierId, setTierId] = useState(() => cheapestTier(event.tickets)?.id ?? "");
  const [done, setDone] = useState(false);

  const ticketed = event.attendanceMode === "tickets" && event.tickets.length > 0;
  const tier = event.tickets.find((t) => t.id === tierId) ?? cheapestTier(event.tickets);

  const close = (next: boolean) => {
    if (attend.isPending) return;
    onOpenChange(next);
    if (!next) setDone(false);
  };

  const submit = () => {
    attend.mutate(event.id, {
      onSuccess: () => {
        setDone(true);
        onAttended();
        toast.success(`You're going to ${event.title}`, { description: `${eventDateLabel(event)} · ${event.startTime} · ${event.venue}` });
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "We couldn't save that. Try again."),
    });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent size="sm">
        {done ? (
          <AttendSuccess event={event} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{TITLE[event.attendanceMode]}</DialogTitle>
              <DialogDescription>{event.title} at {event.venue}, {event.place}.</DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-5">
              <DataList
                columns={2}
                items={[
                  { label: "Date", value: fullDateLabel(event) },
                  { label: "Time", value: <span className="tabular">{formatTimeRange(event.startTime, event.endTime)}</span> },
                ]}
              />
              {ticketed ? (
                <fieldset className="space-y-2">
                  <legend className="mb-2 text-xs font-medium text-fg-muted">Choose a ticket</legend>
                  {[...event.tickets].sort((a, b) => a.price - b.price).map((t) => (
                    <label
                      key={t.id}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border-strong px-3 py-2.5 transition-colors",
                        "has-[:checked]:border-navy-900 has-[:checked]:bg-navy-50",
                        t.soldOut && "pointer-events-none opacity-50",
                      )}
                    >
                      <input
                        type="radio"
                        name="ticket-tier"
                        value={t.id}
                        checked={t.id === tier?.id}
                        disabled={t.soldOut}
                        onChange={() => setTierId(t.id)}
                        className="sr-only"
                      />
                      <span aria-hidden className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface">
                        {t.id === tier?.id ? <span className="size-2 rounded-full bg-navy-900" /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{t.name}</span>
                        {t.description ? <span className="block text-xs text-fg-muted">{t.description}</span> : null}
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular">{t.price === 0 ? "Free" : formatRwf(t.price)}</span>
                    </label>
                  ))}
                </fieldset>
              ) : null}
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost" disabled={attend.isPending}>Not now</Button></DialogClose>
              <Button onClick={submit} loading={attend.isPending} disabled={ticketed && !tier}>
                {ticketed && tier ? `${CONFIRM.tickets} · ${tier.price === 0 ? "Free" : formatRwf(tier.price)}` : CONFIRM[event.attendanceMode]}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AttendSuccess({ event }: { event: Event }) {
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
      <DialogTitle className="mt-4">You&apos;re going</DialogTitle>
      <DialogDescription className="mt-1">
        {fullDateLabel(event)} · {event.startTime} at {event.venue}. Bring ID if you have it — some doors check.
      </DialogDescription>
      <div className="mt-6 flex w-full flex-col gap-2">
        <Button variant="outline" onClick={() => toast("Calendar export is not part of the prototype")}>
          <CalendarPlus aria-hidden /> Add to calendar
        </Button>
        <DialogClose asChild><Button>Done</Button></DialogClose>
      </div>
    </div>
  );
}
