"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Textarea } from "@/components/ui";
import { useCancelOrganizerEvent, useDeleteOrganizerDraft, useSubmitOrganizerEvent } from "@/features/events";
import { useEmployerSession } from "@/features/session";
import { pluralize } from "@/lib/utils";
import type { Event } from "@/types";
import { errorMessage } from "./organizer-helpers";

interface DialogProps {
  /** Pass the event to open; null closes. */
  event: Event | null;
  onClose: () => void;
  onDone?: (event: Event) => void;
}

/** Draft → the review queue. */
export function SubmitEventDialog({ event, onClose, onDone }: DialogProps) {
  const { employerId } = useEmployerSession();
  const submit = useSubmitOrganizerEvent(employerId);

  const confirm = () => {
    if (!event) return;
    submit.mutate(event.id, {
      onSuccess: (e) => {
        toast.success("Submitted", { description: `GigSyc will review ${e.title}, usually within a day.` });
        onDone?.(e);
        onClose();
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  return (
    <Dialog open={!!event} onOpenChange={(open) => { if (!open && !submit.isPending) onClose(); }}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Submit for review?</DialogTitle>
          <DialogDescription>
            {event ? <><span className="font-medium text-fg">{event.title}</span> goes to GigSyc. We check every event before it goes live, usually within a day. You can still edit it while it&apos;s with us.</> : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" disabled={submit.isPending}>Not yet</Button></DialogClose>
          <Button onClick={confirm} loading={submit.isPending}>Submit for review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type Mode = "discard" | "withdraw" | "cancel";

const modeFor = (e: Event): Mode => (e.status === "draft" ? "discard" : e.status === "pending_review" ? "withdraw" : "cancel");

const COPY: Record<Mode, { title: string; confirm: string; keep: string; toast: string; toastBody: string }> = {
  discard: {
    title: "Discard this draft?",
    confirm: "Discard draft",
    keep: "Keep draft",
    toast: "Draft discarded",
    toastBody: "It's gone. Nothing was submitted, so nobody else ever saw it.",
  },
  withdraw: {
    title: "Withdraw from review?",
    confirm: "Withdraw",
    keep: "Keep it with GigSyc",
    toast: "Withdrawn",
    toastBody: "GigSyc won't review it. It's kept under Past as cancelled.",
  },
  cancel: {
    title: "Cancel this event?",
    confirm: "Cancel event",
    keep: "Keep event",
    toast: "Cancelled",
    toastBody: "It no longer appears on GigSyc.",
  },
};

/**
 * One dialog, three moments: discarding a draft, withdrawing from review, or calling off a
 * live event. A draft is private so it is simply deleted; anything submitted stays on record
 * as cancelled, and the copy says so.
 */
export function CancelEventDialog({ event, onClose, onDone }: DialogProps) {
  const { employerId } = useEmployerSession();
  const cancel = useCancelOrganizerEvent(employerId);
  const remove = useDeleteOrganizerDraft(employerId);
  const [reason, setReason] = useState("");
  const mode: Mode = event ? modeFor(event) : "cancel";
  const copy = COPY[mode];

  const pending = cancel.isPending || remove.isPending;

  const confirm = () => {
    if (!event) return;
    const finish = (e?: Event) => {
      toast.success(copy.toast, { description: copy.toastBody });
      setReason("");
      onDone?.(e ?? { ...event, status: "cancelled" });
      onClose();
    };
    const fail = (err: unknown) => toast.error(errorMessage(err));
    if (mode === "discard") {
      remove.mutate(event.id, { onSuccess: () => finish(), onError: fail });
      return;
    }
    const trimmed = reason.trim();
    const payload = mode === "withdraw" ? "Withdrawn from review" : trimmed || undefined;
    cancel.mutate({ id: event.id, reason: payload }, { onSuccess: finish, onError: fail });
  };

  return (
    <Dialog open={!!event} onOpenChange={(open) => { if (!open && !pending) onClose(); }}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            {event ? (
              <>
                <span className="font-medium text-fg">{event.title}</span>.{" "}
                {mode === "discard" ? "Nothing was submitted, so nobody else has seen it." : null}
                {mode === "withdraw" ? "GigSyc stops reviewing it straight away." : null}
                {mode === "cancel" ? (
                  <>It leaves GigSyc immediately{event.attending > 0 ? ` and the ${pluralize(event.attending, "guest")} going will be told` : ""}.</>
                ) : null}{" "}
                This can&apos;t be undone.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        {mode === "cancel" ? (
          <DialogBody className="pt-0">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-fg">Tell your guests why <span className="font-normal text-fg-muted">(optional)</span></span>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Weather, a venue change, low numbers…" rows={3} className="min-h-20" disabled={pending} />
            </label>
          </DialogBody>
        ) : null}
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" disabled={pending}>{copy.keep}</Button></DialogClose>
          <Button variant="danger" onClick={confirm} loading={pending}>{copy.confirm}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
