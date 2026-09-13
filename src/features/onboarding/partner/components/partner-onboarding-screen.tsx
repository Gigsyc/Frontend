"use client";

import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useId, useReducer, useState, type Dispatch } from "react";
import { toast } from "sonner";
import { OnboardingShell } from "@/components/layout/onboarding-shell";
import { Button } from "@/components/ui/button";
import { RequireOnboarding, RequireRole, useAuth } from "@/features/auth";
import { errorMessage } from "@/lib/utils";
import {
  clearDraft, fullPhone, INITIAL_STATE, loadDraft, reducer, saveDraft, TOTAL_STEPS,
  validateStep, type Action, type PartnerOnboardingState, type StepErrors,
} from "../lib/state";
import { PartnerOnboardingDone } from "./partner-onboarding-done";
import { PartnerOnboardingSkeleton } from "./partner-onboarding-skeleton";
import { StepContact } from "./step-contact";
import { StepLocation } from "./step-location";
import { StepOrganisation } from "./step-organisation";

type Phase = "editing" | "saving" | "done";

/**
 * Three questions, then the workspace. Every answer lives in the reducer here — above both
 * guards — and is mirrored to sessionStorage under the signed-in user's key, so a refresh
 * mid-setup keeps the answers and a second account in the same tab never inherits them.
 *
 * Two guards, both from `@/features/auth` — routing rules are never re-implemented here.
 * `RequireRole` stays mounted for the whole screen: `completePartnerOnboarding` creates an
 * Employer record and sets `role: "partner"`, so a customer or worker who opened this URL
 * with onboarding still open would be promoting their own account. `RequireOnboarding`
 * checks the session and the unfinished flag, and steps aside the moment we start saving —
 * finishing flips `onboardingCompleted`, and a mounted guard would redirect over the
 * confirmation panel. Entry is still guarded; nobody reaches "saving" without passing it.
 */
export function PartnerOnboardingScreen() {
  const { user, completePartnerOnboarding } = useAuth();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [phase, setPhase] = useState<Phase>("editing");
  const [saved, setSaved] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const userId = user?.id;
  const name = user?.name;

  // Restore this account's draft once, and let the account's own name stand in for the contact.
  useEffect(() => {
    if (!userId) return;
    const draft = loadDraft(userId);
    dispatch({ type: "hydrate", userId, state: { ...draft, contactName: draft.contactName || (name ?? "") } });
    // Per account, once: later changes are written back by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => { if (state.hydrated) saveDraft(state); }, [state]);

  /** Leaving a question drops a save error that no longer describes the screen you are on. */
  const navigate = useCallback<Dispatch<Action>>((action) => {
    if (action.type === "goto") setSaveError(null);
    dispatch(action);
  }, []);

  const finish = useCallback(async () => {
    if (!userId) return;
    // A draft restored from an older session can be missing a tile answer. Send them back to
    // the question rather than letting "Finish setup" do nothing at all.
    if (!state.organizationType) { navigate({ type: "goto", step: 0 }); return; }
    if (!state.place) { navigate({ type: "goto", step: 2 }); return; }

    const organizationName = state.organizationName.trim();
    setPhase("saving");
    setSaveError(null);
    try {
      await completePartnerOnboarding({
        organizationName,
        organizationType: state.organizationType,
        contactName: state.contactName.trim(),
        phone: fullPhone(state.phone),
        place: state.place,
      });
      clearDraft(userId);
      toast.success("Partner workspace created", { description: `${organizationName} can post shifts straight away.` });
      setSaved(organizationName);
      setPhase("done");
    } catch (err) {
      const message = errorMessage(err, "We couldn't finish setting up your organisation. Try again.");
      setPhase("editing");
      setSaveError(message);
      toast.error(message);
    }
  }, [completePartnerOnboarding, navigate, state.contactName, state.organizationName, state.organizationType, state.phone, state.place, userId]);

  const wizard = !user || !state.hydrated || state.userId !== user.id
    ? <PartnerOnboardingSkeleton />
    : (
      <PartnerOnboardingWizard
        state={state}
        dispatch={navigate}
        accountEmail={user.email}
        saving={phase === "saving"}
        saveError={saveError}
        onFinish={finish}
      />
    );

  const content = phase === "done"
    ? <PartnerOnboardingDone organizationName={saved} />
    : phase === "saving"
      ? wizard
      : <RequireOnboarding role="partner">{wizard}</RequireOnboarding>;

  return <RequireRole roles={["partner"]}>{content}</RequireRole>;
}

interface WizardProps {
  state: PartnerOnboardingState;
  dispatch: Dispatch<Action>;
  accountEmail: string;
  saving: boolean;
  saveError: string | null;
  onFinish: () => void;
}

/** The three questions. Answers live above this; only what has been *attempted* lives here. */
function PartnerOnboardingWizard({ state, dispatch, accountEmail, saving, saveError, onFinish }: WizardProps) {
  const [attempted, setAttempted] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState<{ organizationName?: string; contactName?: string; phone?: string }>({});
  const errorId = useId();

  const isLast = state.step === TOTAL_STEPS - 1;
  const found = validateStep(state.step, state);
  const seen = !!attempted[state.step];
  // Tiles answer on click, so their message can appear as soon as the step is attempted.
  // Typed fields wait until the exact text they were written about comes back on blur.
  const errors: StepErrors = {
    organizationType: seen ? found.organizationType : undefined,
    place: seen ? found.place : undefined,
    organizationName: seen && checked.organizationName === state.organizationName ? found.organizationName : undefined,
    contactName: seen && checked.contactName === state.contactName ? found.contactName : undefined,
    phone: seen && checked.phone === state.phone ? found.phone : undefined,
  };

  const recheck = () => {
    if (!seen) return;
    setChecked({ organizationName: state.organizationName, contactName: state.contactName, phone: state.phone });
  };

  const advance = () => {
    setAttempted((a) => ({ ...a, [state.step]: true }));
    setChecked({ organizationName: state.organizationName, contactName: state.contactName, phone: state.phone });
    if (Object.keys(validateStep(state.step, state)).length > 0) return;
    if (!isLast) { dispatch({ type: "goto", step: state.step + 1 }); return; }
    onFinish();
  };

  return (
    <OnboardingShell
      step={state.step}
      total={TOTAL_STEPS}
      onBack={() => dispatch({ type: "goto", step: state.step - 1 })}
      secondary={<p className="text-[13px] text-fg-muted">Answers are saved as you go.</p>}
      primary={
        <Button
          size="lg"
          className="h-12 min-w-36"
          onClick={advance}
          loading={saving}
          aria-describedby={saveError ? errorId : undefined}
        >
          {isLast ? "Finish setup" : <>Continue <ArrowRight /></>}
        </Button>
      }
    >
      {state.step === 0 ? <StepOrganisation state={state} errors={errors} dispatch={dispatch} onBlurField={recheck} /> : null}
      {state.step === 1 ? <StepContact state={state} errors={errors} dispatch={dispatch} onBlurField={recheck} accountEmail={accountEmail} /> : null}
      {state.step === 2 ? <StepLocation state={state} errors={errors} dispatch={dispatch} /> : null}

      {saveError ? (
        <p id={errorId} role="alert" className="mt-6 rounded-md bg-danger-50 px-3 py-2.5 text-[13px] leading-5 text-danger-700">
          {saveError}
        </p>
      ) : null}
    </OnboardingShell>
  );
}
