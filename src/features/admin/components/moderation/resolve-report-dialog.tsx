"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { useResolveReport } from "@/features/admin";
import { errorMessage } from "@/lib/utils";
import type { Report } from "@/types";

export type Outcome = "resolved" | "dismissed";

type ResolveMutation = ReturnType<typeof useResolveReport>;

interface Props {
  target: { report: Report; outcome: Outcome } | null;
  onClose: () => void;
}

const MIN = 10;

const COPY: Record<Outcome, { title: string; description: string; hint: string; confirm: string }> = {
  resolved: {
    title: "Resolve this report",
    description: "Say what you did. The note stays on the record for whoever reads it next.",
    hint: "For example: “Organiser confirmed a second marshal and the exit is clear.”",
    confirm: "Resolve report",
  },
  dismissed: {
    title: "Dismiss this report",
    description: "Say why no action was needed. The note stays on the record.",
    hint: "For example: “Checked the door log — times match the listing.”",
    confirm: "Dismiss report",
  },
};

const validate = (value: string) => (value.trim().length < MIN ? `Write at least ${MIN} characters so the note is useful later.` : undefined);

/** Keyed by report and outcome, so every reopen starts from an empty note. */
function ResolveForm({ report, outcome, resolve, onClose }: { report: Report; outcome: Outcome; resolve: ResolveMutation; onClose: () => void }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const copy = COPY[outcome];

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    const problem = validate(note);
    setError(problem);
    if (problem) return;
    resolve.mutate(
      { id: report.id, outcome, resolution: note.trim() },
      {
        onSuccess: () => {
          toast.success(
            outcome === "resolved"
              ? `Resolved. The report on ${report.targetLabel} is closed.`
              : `Dismissed. No action taken on ${report.targetLabel}.`,
          );
          onClose();
        },
        onError: (err) => toast.error(errorMessage(err, "We couldn't close this report. Try again.")),
      },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-col">
      <DialogHeader>
        <DialogTitle>{copy.title}</DialogTitle>
        <DialogDescription>{report.reason} · {report.targetLabel}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <Field label="Resolution note" required error={error} hint={copy.hint}>
          {(p) => (
            <Textarea
              {...p}
              rows={4}
              autoFocus
              value={note}
              onChange={(e) => { setNote(e.target.value); if (submitted) setError(validate(e.target.value)); }}
              onBlur={() => { if (submitted) setError(validate(note)); }}
            />
          )}
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild><Button variant="ghost" disabled={resolve.isPending}>Cancel</Button></DialogClose>
        <Button type="submit" variant={outcome === "dismissed" ? "outline" : "primary"} loading={resolve.isPending}>{copy.confirm}</Button>
      </DialogFooter>
    </form>
  );
}

export function ResolveReportDialog({ target, onClose }: Props) {
  const resolve = useResolveReport();
  if (!target) return null;

  return (
    <Dialog open onOpenChange={(o) => { if (!o && !resolve.isPending) onClose(); }}>
      <DialogContent size="md">
        <ResolveForm
          key={`${target.report.id}:${target.outcome}`}
          report={target.report}
          outcome={target.outcome}
          resolve={resolve}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
