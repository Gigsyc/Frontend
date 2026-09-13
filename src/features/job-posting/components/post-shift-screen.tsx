"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ChevronLeft, FilePlus2, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, CardContent, EmptyState, PageHeader, Stepper } from "@/components/ui";
import { useEmployer } from "@/features/employers";
import { useEmployerSession } from "@/features/session";
import { useCreateShift, useShift, useUpdateShift } from "@/features/shifts";
import { useWorkers } from "@/features/workers";
import { errorMessage, isNotFoundError } from "@/lib/utils";
import type { Shift } from "@/types";
import { buildShiftInput } from "../build-shift";
import { clearDraft, INITIAL_STATE, loadDraft, saveDraft, STEPS, wizardReducer, type WizardState } from "../state";
import { firstInvalidStep, validateStep } from "../validation";
import { DiscardDialog } from "./discard-dialog";
import { PostShiftSkeleton } from "./post-shift-skeleton";
import { StepPayDetails } from "./step-pay-details";
import { StepReview } from "./step-review";
import { StepRole } from "./step-role";
import { StepWhenWhere } from "./step-when-where";
import { WizardFooter } from "./wizard-footer";

interface PostShiftScreenProps {
  /** ?from=<shiftId> — prefill from an existing shift (Duplicate, or Edit on a draft). */
  from?: string;
}

const LAST = STEPS.length - 1;

/** /employer/jobs/new — four steps, one reducer, persisted to sessionStorage so a refresh keeps the form. */
export function PostShiftScreen({ from }: PostShiftScreenProps) {
  const router = useRouter();
  const { employerId } = useEmployerSession();
  const employerQ = useEmployer(employerId);
  const sourceQ = useShift(from);
  const workersQ = useWorkers({});
  const create = useCreateShift();
  const update = useUpdateShift(from ?? "");

  const [state, dispatch] = useReducer(wizardReducer, INITIAL_STATE);
  const hydrated = state.hydrated;
  const [discardOpen, setDiscardOpen] = useState(false);
  const [submitting, setSubmitting] = useState<"open" | "draft" | null>(null);
  const warnedAboutSource = useRef(false);

  const sourceFailed = !!from && sourceQ.isError;
  const sourceMissing = sourceFailed && isNotFoundError(sourceQ.error);
  const source = from && !sourceFailed ? sourceQ.data : undefined;
  const sourceIsDraft = source?.status === "draft";
  /**
   * Save back into the source instead of creating a second shift. The `fromId` check means the
   * form really holds that draft's content — the prefill has landed, or the session restored it.
   */
  const editingDraft = sourceIsDraft && state.fromId === from;

  // 1. Restore an in-progress form (unless we're duplicating a different shift).
  useEffect(() => {
    warnedAboutSource.current = false;
    const saved = loadDraft();
    if (saved && (!from || saved.fromId === from)) dispatch({ type: "hydrate", state: saved });
    else dispatch({ type: "ready" });
  }, [from]);

  // 2. Prefill from the source shift once it arrives.
  useEffect(() => {
    if (hydrated && from && sourceQ.data && state.fromId !== from) dispatch({ type: "prefill", shift: sourceQ.data, fromId: from });
  }, [hydrated, from, sourceQ.data, state.fromId]);

  // 2b. The source shift couldn't be read — forget it so we never try to save back into it.
  useEffect(() => {
    if (!sourceFailed || warnedAboutSource.current) return;
    warnedAboutSource.current = true;
    dispatch({ type: "detachSource" });
    if (!isNotFoundError(sourceQ.error)) {
      toast.error(errorMessage(sourceQ.error), { description: "We couldn't copy that shift — carry on with a blank form." });
    }
  }, [sourceFailed, sourceQ.error]);

  // 3. Supervisor defaults to the account contact.
  useEffect(() => {
    const c = employerQ.data?.contact;
    if (c && hydrated && !state.supervisorPrefilled && !state.supervisorName && !state.supervisorPhone) {
      dispatch({ type: "set", patch: { supervisorName: c.name, supervisorPhone: c.phone, supervisorPrefilled: true, dirty: state.dirty } });
    }
  }, [employerQ.data, hydrated, state.supervisorPrefilled, state.supervisorName, state.supervisorPhone, state.dirty]);

  // 4. Persist every change.
  useEffect(() => {
    if (hydrated) saveDraft(state);
  }, [state, hydrated]);

  const errors = useMemo(() => (state.showErrors ? validateStep(state.step, state) : {}), [state]);
  const set = (patch: Partial<WizardState>) => dispatch({ type: "set", patch });

  const next = () => {
    if (Object.keys(validateStep(state.step, state)).length) {
      dispatch({ type: "showErrors" });
      return;
    }
    dispatch({ type: "goto", step: state.step + 1 });
  };

  const submit = (status: "open" | "draft") => {
    const invalid = firstInvalidStep(state, status);
    if (invalid !== null) {
      dispatch({ type: "goto", step: invalid });
      dispatch({ type: "showErrors" });
      toast.error("A few details are missing", {
        description: status === "draft"
          ? "A draft needs a role and a title so you can find it again."
          : `Finish step ${invalid + 1} before posting.`,
      });
      return;
    }
    setSubmitting(status);

    const input = buildShiftInput(state, employerId, status);
    const onSuccess = (shift: Shift) => {
      clearDraft();
      const matches = (workersQ.data ?? []).filter((w) => w.skills.includes(shift.role)).length;
      const notified = Math.min(5, matches);
      if (status === "open") {
        toast.success("Shift posted", {
          description: state.postTo === "pool"
            ? `Your talent pool hears first. ${notified} matching workers will be notified after that.`
            : `We're notifying ${notified} matching workers.`,
        });
      } else {
        toast.success(editingDraft ? "Draft updated" : "Draft saved", {
          description: "Find it under Drafts in Jobs whenever you're ready to post.",
        });
      }
      router.push(`/employer/jobs/${shift.id}`);
    };
    const onError = (err: unknown) => {
      setSubmitting(null);
      toast.error(errorMessage(err));
    };

    // Finishing an existing draft saves back into it, so the employer never ends up with two rows.
    if (editingDraft) update.mutate(input, { onSuccess, onError });
    else create.mutate(input, { onSuccess, onError });
  };

  const cancel = () => {
    if (state.dirty) setDiscardOpen(true);
    else leave();
  };
  const leave = () => {
    clearDraft();
    router.push("/employer/jobs");
  };

  if (!hydrated || (from && sourceQ.isPending)) return <PostShiftSkeleton />;

  if (sourceMissing) {
    return (
      <EmptyState
        icon={SearchX}
        title="That shift no longer exists"
        description="It may have been discarded, or the link is out of date. You can still post a new shift from scratch."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" asChild><Link href="/employer/jobs"><ChevronLeft /> Back to Jobs</Link></Button>
            <Button asChild><Link href="/employer/jobs/new"><FilePlus2 /> Start a blank shift</Link></Button>
          </div>
        }
        className="rounded-lg bg-surface shadow-card"
      />
    );
  }

  const pending = create.isPending || update.isPending;
  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/employer/jobs"
        backLabel="Jobs"
        title={sourceIsDraft ? "Finish your draft" : "Post a shift"}
        description={
          sourceIsDraft
            ? "Pick up where you left off. Nothing is public until you post it."
            : source
              ? `Prefilled from “${source.title}”. Check the date before you post.`
              : "Four short steps. Workers with the right skills are notified the moment you post."
        }
        actions={<Button variant="ghost" onClick={cancel}>Cancel</Button>}
      />

      <Stepper steps={[...STEPS]} current={state.step} onStepClick={(i) => dispatch({ type: "goto", step: i })} />

      <form noValidate onSubmit={(e) => { e.preventDefault(); if (state.step < LAST) next(); }} className="space-y-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            {state.step === 0 ? <StepRole state={state} errors={errors} set={set} /> : null}
            {state.step === 1 ? <StepWhenWhere state={state} errors={errors} set={set} /> : null}
            {state.step === 2 ? <StepPayDetails state={state} errors={errors} set={set} /> : null}
            {state.step === 3 ? <StepReview state={state} employer={employerQ.data} employerId={employerId} /> : null}
          </CardContent>
        </Card>
        <WizardFooter
          step={state.step}
          lastStep={LAST}
          onBack={() => dispatch({ type: "goto", step: state.step - 1 })}
          onNext={next}
          onSaveDraft={() => submit("draft")}
          onPost={() => submit("open")}
          posting={pending && submitting === "open"}
          savingDraft={pending && submitting === "draft"}
          draftLabel={sourceIsDraft ? "Update draft" : "Save draft"}
        />
      </form>

      <DiscardDialog open={discardOpen} onOpenChange={setDiscardOpen} onDiscard={leave} />
    </div>
  );
}
