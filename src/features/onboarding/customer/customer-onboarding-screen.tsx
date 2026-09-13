"use client";

import { useCallback, useEffect, useReducer, useState, type Dispatch } from "react";
import { toast } from "sonner";
import { RequireOnboarding, RequireRole, useAuth } from "@/features/auth";
import { useEvents } from "@/features/events";
import { errorMessage } from "@/lib/utils";
import type { CustomerOnboardingInput, DiscoveryPreferenceId } from "@/types";
import { OnboardingComplete } from "./onboarding-complete";
import { CustomerOnboardingFlow } from "./onboarding-flow";
import {
  CORE_STEPS, INITIAL_STATE, MIN_INTERESTS, PREFERENCE_STEP,
  clearDraft, firstNameOf, loadDraft, placeFor, reducer, saveDraft, summaryLine,
  type Action, type SavedOnboarding,
} from "./state";

type Phase = "editing" | "saving" | "done";

/**
 * Three quick questions and an optional fourth. All step state lives in the reducer here and is
 * mirrored to sessionStorage under the signed-in user's key, so a refresh mid-flow keeps the
 * answers and a second account in the same tab never inherits them.
 *
 * Two guards, both from `@/features/auth` — routing rules are never re-implemented here.
 * `RequireRole` stays mounted for the whole screen: this is the *customer* flow, and a partner
 * or worker who lands on it would otherwise finish it and have `onboardingCompleted` set with no
 * record on the other side. `RequireOnboarding` steps aside the moment we start saving, because
 * `completeOnboarding` flips `onboardingCompleted` and a mounted guard would redirect over the
 * confirmation panel. Entry is still guarded; nobody reaches "saving" without passing it first.
 */
export function CustomerOnboardingScreen() {
  const { user, completeOnboarding } = useAuth();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [phase, setPhase] = useState<Phase>("editing");
  const [saved, setSaved] = useState<SavedOnboarding | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const events = useEvents({});
  const userId = user?.id;

  useEffect(() => { if (userId) dispatch({ type: "hydrate", state: loadDraft(userId) }); }, [userId]);
  useEffect(() => { if (state.hydrated) saveDraft(state); }, [state]);

  /** Leaving a question drops a save error that no longer describes the screen you are on. */
  const navigate = useCallback<Dispatch<Action>>((action) => {
    if (action.type === "goto") setSaveError(null);
    dispatch(action);
  }, []);

  const finish = useCallback(async (preference: DiscoveryPreferenceId | null) => {
    const location = placeFor(state.selection);
    if (!location) { navigate({ type: "goto", step: 1 }); return; }
    if (state.interests.length < MIN_INTERESTS) { navigate({ type: "goto", step: 2 }); return; }

    const input: CustomerOnboardingInput = { location, interests: state.interests };
    if (preference) input.discoveryPreference = preference;

    // Snapshot what we send. The confirmation panel describes this, never the live reducer.
    const snapshot: SavedOnboarding = {
      input,
      anywhere: state.selection === "anywhere",
      total: state.step >= PREFERENCE_STEP ? PREFERENCE_STEP + 1 : CORE_STEPS,
    };

    setPhase("saving");
    setSaveError(null);
    try {
      await completeOnboarding(input);
      if (userId) clearDraft(userId);
      setSaved(snapshot);
      setPhase("done");
    } catch (err) {
      const message = errorMessage(err, "We couldn't save your answers. Try again.");
      setPhase("editing");
      setSaveError(message);
      toast.error(message);
    }
  }, [completeOnboarding, navigate, state.interests, state.selection, state.step, userId]);

  const flow = (
    <CustomerOnboardingFlow
      state={state}
      dispatch={navigate}
      firstName={firstNameOf(user?.name)}
      events={{
        list: events.data,
        pending: events.isPending,
        error: events.isError,
        retry: () => { void events.refetch(); },
      }}
      saving={phase === "saving"}
      saveError={saveError}
      onFinish={finish}
    />
  );

  const content = phase === "done" && saved
    ? <OnboardingComplete summary={summaryLine(saved)} total={saved.total} />
    : phase === "saving"
      ? flow
      : <RequireOnboarding role="customer">{flow}</RequireOnboarding>;

  return <RequireRole roles={["customer"]}>{content}</RequireRole>;
}
