"use client";

import { useCallback, useState } from "react";
import {
  Button, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Field, Textarea,
} from "@/components/ui";
import { pluralize } from "@/lib/utils";
import type { Event } from "@/types";
import { useEventStatusActions } from "../../hooks/use-event-status-actions";
import type { EventActionDef } from "./event-actions";

export interface PendingAction {
  events: Event[];
  action: EventActionDef;
}

const MIN_REASON = 10;

/**
 * One place that decides whether an action runs straight away, asks for confirmation, or asks
 * for a written reason first. Shared by the table row menu, the bulk bar and the record screen.
 */
export function useEventActionFlow() {
  const actions = useEventStatusActions();
  const [pending, setPending] = useState<PendingAction | null>(null);
  /** The action that ran without a dialog, so the button that was pressed is the one that spins. */
  const [runningActionId, setRunningActionId] = useState<string | null>(null);

  const start = useCallback(
    (events: Event[], action: EventActionDef, alwaysConfirm = false) => {
      if (events.length === 0) return;
      if (alwaysConfirm || action.needsReason || action.confirm || events.length > 1) {
        setPending({ events, action });
        return;
      }
      setRunningActionId(action.id);
      void actions.setStatus(events[0], action.status).finally(() => setRunningActionId(null));
    },
    [actions],
  );

  const cancel = useCallback(() => setPending(null), []);

  const confirm = useCallback(
    async (note?: string) => {
      if (!pending) return;
      const done = pending.events.length === 1
        ? await actions.setStatus(pending.events[0], pending.action.status, note)
        : (await actions.setStatusMany(pending.events, pending.action.status, note)) > 0;
      if (done) setPending(null);
    },
    [actions, pending],
  );

  return {
    pending, start, cancel, confirm,
    runningActionId,
    setFeatured: actions.setFeatured,
    isPending: actions.isPending,
    pendingId: actions.pendingId,
    featuredPendingId: actions.featuredPendingId,
  };
}

interface DialogsProps {
  pending: PendingAction | null;
  onCancel: () => void;
  onConfirm: (note?: string) => void;
  busy: boolean;
}

/** Mounted once per screen; the inner content is keyed so the typed reason never leaks between events. */
export function EventActionDialogs({ pending, onCancel, onConfirm, busy }: DialogsProps) {
  return (
    <Dialog open={pending !== null} onOpenChange={(open) => { if (!open && !busy) onCancel(); }}>
      {pending ? (
        pending.action.needsReason ? (
          <RejectDialog key={keyOf(pending)} pending={pending} onConfirm={onConfirm} busy={busy} />
        ) : (
          <ConfirmDialog key={keyOf(pending)} pending={pending} onConfirm={onConfirm} busy={busy} />
        )
      ) : null}
    </Dialog>
  );
}

const keyOf = (p: PendingAction) => `${p.action.id}:${p.events.map((e) => e.id).join(",")}`;

const subjectOf = (events: Event[]) => (events.length === 1 ? events[0].title : pluralize(events.length, "event"));

function RejectDialog({ pending, onConfirm, busy }: { pending: PendingAction; onConfirm: (note: string) => void; busy: boolean }) {
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const many = pending.events.length > 1;
  const tooShort = note.trim().length < MIN_REASON;
  const error = submitted && tooShort ? `Write at least ${MIN_REASON} characters so the organiser knows what to fix.` : undefined;

  const submit = () => {
    setSubmitted(true);
    if (tooShort) return;
    onConfirm(note.trim());
  };

  return (
    <DialogContent size="md">
      <DialogHeader>
        <DialogTitle>{many ? `Reject ${pluralize(pending.events.length, "event")}?` : `Reject ${pending.events[0].title}?`}</DialogTitle>
        <DialogDescription>
          The organiser is notified with your reason word for word, and it stays on the record here.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <Field
          label="Why is it being rejected?"
          hint="Name the specific problem — a missing safety plan, a hidden venue, misleading pricing."
          error={error}
          required
        >
          {(p) => (
            <Textarea
              {...p}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => setSubmitted(true)}
              placeholder="The submission doesn't list a marshal plan or ambulance cover for a night route on the ring road."
              autoFocus
            />
          )}
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" disabled={busy}>Keep it in review</Button>
        </DialogClose>
        <Button variant="danger" onClick={submit} loading={busy}>{many ? "Reject events" : "Reject event"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ConfirmDialog({ pending, onConfirm, busy }: { pending: PendingAction; onConfirm: () => void; busy: boolean }) {
  const many = pending.events.length > 1;
  const copy = pending.action.confirm ?? {
    title: `${pending.action.label}?`,
    body: many
      ? "Each one goes live on /events straight away and every organiser is notified."
      : "It goes live on /events straight away and the organiser is notified.",
    cta: pending.action.label,
  };

  return (
    <DialogContent size="sm">
      <DialogHeader>
        <DialogTitle>{many ? `${copy.cta} ${pluralize(pending.events.length, "event")}?` : copy.title}</DialogTitle>
        <DialogDescription>{copy.body}</DialogDescription>
      </DialogHeader>
      <DialogBody className="py-0">
        <p className="rounded-md bg-ink-50 px-3 py-2.5 text-sm text-fg">{subjectOf(pending.events)}</p>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" disabled={busy}>Keep as it is</Button>
        </DialogClose>
        <Button variant={pending.action.destructive ? "danger" : "primary"} onClick={() => onConfirm()} loading={busy}>{copy.cta}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
