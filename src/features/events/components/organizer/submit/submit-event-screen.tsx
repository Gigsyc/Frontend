"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { AlertTriangle, ChevronLeft, LockKeyhole, SearchX } from "lucide-react";
import { Button, Card, CardContent, EmptyState, ErrorState, PageHeader, Stepper } from "@/components/ui";
import type { EventStatus } from "@/types";
import { LeaveDialog } from "./leave-dialog";
import { STEPS } from "./state";
import { StepBasics } from "./step-basics";
import { StepCoverReview } from "./step-cover-review";
import { StepTickets } from "./step-tickets";
import { StepWhenWhere } from "./step-when-where";
import { SubmitEventSkeleton } from "./submit-event-skeleton";
import { SubmitFooter } from "./submit-footer";
import { EDITABLE, useSubmitEventForm } from "./use-submit-event-form";

interface SubmitEventScreenProps {
  /** ?edit=<eventId> — change an event that is still a draft, in review, or was sent back. */
  editId?: string;
}

const LAST = STEPS.length - 1;

const EDIT_COPY: Partial<Record<EventStatus, string>> = {
  draft: "Pick up where you left off. Nothing is public until GigSyc has reviewed it.",
  pending_review: "It's with GigSyc right now — any change you save here is what they'll review.",
  rejected: "Fix what GigSyc flagged and resubmit. They'll take another look, usually within a day.",
};

const LOCKED_COPY: Partial<Record<EventStatus, string>> = {
  published: "It's live on GigSyc, so changes need to go through the team. Cancelling is still in your hands from the event page.",
  cancelled: "This event was cancelled, so there's nothing left to change. You can always submit it again as a new event.",
  completed: "This event has already happened. Submit a new one for the next date.",
};

/** /employer/events/new — four steps, one reducer, persisted per event so a refresh keeps the form. */
export function SubmitEventScreen({ editId }: SubmitEventScreenProps) {
  const f = useSubmitEventForm(editId);
  const { state, errors, set, original } = f;

  if (f.loading) return <SubmitEventSkeleton />;

  if (f.notFound) {
    return (
      <EmptyState
        icon={SearchX}
        title="We couldn't find that event"
        description="It may have been removed, or the link is out of date. Your other events are still where you left them."
        action={<Button variant="outline" className="h-11" asChild><Link href="/employer/events"><ChevronLeft /> Back to Events</Link></Button>}
        className="rounded-lg bg-surface shadow-card"
      />
    );
  }
  if (f.loadError) return <ErrorState error={f.loadError} className="rounded-lg bg-surface shadow-card" />;

  if (original && !EDITABLE.includes(original.status)) {
    return (
      <EmptyState
        icon={LockKeyhole}
        title="This event can't be edited here"
        description={LOCKED_COPY[original.status]}
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" className="h-11" asChild><Link href={`/employer/events/${original.id}`}><ChevronLeft /> Back to the event</Link></Button>
            <Button className="h-11" asChild><Link href="/employer/events/new">Submit a new event</Link></Button>
          </div>
        }
        className="rounded-lg bg-surface shadow-card"
      />
    );
  }

  const status = f.editing ? original?.status : undefined;
  const showDraft = !status || status === "draft";
  const submitLabel = status === "rejected" ? "Resubmit" : status === "pending_review" ? "Save changes" : "Submit for review";

  return (
    <div className="space-y-8">
      <PageHeader
        backHref={editId ? `/employer/events/${editId}` : "/employer/events"}
        backLabel={editId ? "Event" : "Events"}
        title={editId ? "Edit event" : "Submit an event"}
        description={status ? EDIT_COPY[status] : "Four short steps. Tell us about your event and GigSyc will review it before it goes live to guests."}
        actions={<Button variant="ghost" className="h-11" onClick={f.cancel}>Cancel</Button>}
      />

      {status === "rejected" && original?.reviewNote ? (
        <div role="status" className="flex gap-3 rounded-lg border border-warning-500/40 bg-warning-50 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-600" aria-hidden />
          <div>
            <p className="font-semibold text-warning-700">GigSyc asked for:</p>
            <p className="mt-0.5 leading-5 text-fg">{original.reviewNote}</p>
          </div>
        </div>
      ) : null}

      <Stepper steps={[...STEPS]} current={state.step} onStepClick={f.goto} />

      <form noValidate onSubmit={(e) => { e.preventDefault(); if (state.step < LAST) f.next(); }} className="space-y-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <motion.div key={state.step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
              {state.step === 0 ? <StepBasics state={state} errors={errors} set={set} /> : null}
              {state.step === 1 ? <StepWhenWhere state={state} errors={errors} set={set} /> : null}
              {state.step === 2 ? <StepTickets state={state} errors={errors} set={set} /> : null}
              {state.step === 3 ? <StepCoverReview state={state} errors={errors} set={set} employer={f.employer} employerId={f.employerId} /> : null}
            </motion.div>
          </CardContent>
        </Card>
        <SubmitFooter
          step={state.step}
          lastStep={LAST}
          onBack={() => f.goto(state.step - 1)}
          onNext={f.next}
          onSaveDraft={() => f.submit("draft")}
          onSubmit={() => f.submit("submit")}
          submitting={f.submitting}
          savingDraft={f.savingDraft}
          showDraft={showDraft}
          draftLabel={status === "draft" ? "Save draft" : "Save as draft"}
          submitLabel={submitLabel}
        />
      </form>

      <LeaveDialog open={f.leaveOpen} onOpenChange={f.setLeaveOpen} onLeave={f.leave} editing={!!editId} />
    </div>
  );
}
