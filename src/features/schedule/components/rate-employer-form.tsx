"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, DialogClose, Field, StarInput, Textarea } from "@/components/ui";
import { useRateEmployer } from "@/features/bookings";
import { employerShortName } from "../lib";
import type { ScheduleItem } from "../types";

interface RateEmployerFormProps {
  item: ScheduleItem;
  onDone: () => void;
  /** Label for the dismiss action ("Skip for now" after check-out, "Cancel" elsewhere). */
  dismissLabel?: string;
}

/** Star rating + optional note, shared by the check-out success step and the "Rate employer" dialog. */
export function RateEmployerForm({ item, onDone, dismissLabel = "Cancel" }: RateEmployerFormProps) {
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const rate = useRateEmployer();
  const short = employerShortName(item.employer?.name);
  const error = touched && score === 0 ? "Pick a star rating first." : undefined;

  const submit = () => {
    setTouched(true);
    if (score === 0) return;
    rate.mutate(
      { bookingId: item.booking.id, rating: { score, note: note.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success(`Thanks — you rated ${short} ${score}/5`, { description: "Ratings help other workers pick good employers." });
          onDone();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-fg">How was working with {short}?</span>
        <StarInput label={`Rate ${item.employer?.name ?? "the employer"}`} value={score} onChange={(v) => { setScore(v); setTouched(true); }} size="lg" disabled={rate.isPending} />
        {error ? <p role="alert" className="text-[13px] text-danger-600">{error}</p> : <p className="text-[13px] text-fg-muted">Only GigSyc and {short} see your rating.</p>}
      </div>
      <Field label="Add a note" optional hint="Briefing, breaks, how the team treated you.">
        {(a11y) => (
          <Textarea {...a11y} value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} placeholder="Clear briefing, meal on time, paid promptly…" className="min-h-20" disabled={rate.isPending} />
        )}
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <DialogClose asChild>
          <Button variant="ghost" disabled={rate.isPending}>{dismissLabel}</Button>
        </DialogClose>
        <Button onClick={submit} loading={rate.isPending}>Send rating</Button>
      </div>
    </div>
  );
}
