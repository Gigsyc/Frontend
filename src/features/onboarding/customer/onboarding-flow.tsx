"use client";

import { ArrowRight } from "lucide-react";
import type { Dispatch } from "react";
import { OnboardingShell } from "@/components/layout/onboarding-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { DiscoveryPreferenceId } from "@/types";
import { StepInterests } from "./steps/step-interests";
import { StepLocation } from "./steps/step-location";
import { StepPreference } from "./steps/step-preference";
import { StepWelcome } from "./steps/step-welcome";
import {
  CORE_STEPS, MIN_INTERESTS, PREFERENCE_STEP,
  type Action, type CustomerOnboardingState, type EventsSummary,
} from "./state";

interface FlowProps {
  state: CustomerOnboardingState;
  dispatch: Dispatch<Action>;
  firstName: string;
  events: EventsSummary;
  saving: boolean;
  saveError: string | null;
  onFinish: (preference: DiscoveryPreferenceId | null) => void;
}

/**
 * The bar counts the three questions we actually ask. Opening the optional fourth widens the
 * total rather than overflowing a bar that already read "3 of 3".
 */
function progressFor(step: number) {
  return step >= PREFERENCE_STEP ? { step, total: PREFERENCE_STEP + 1 } : { step, total: CORE_STEPS };
}

export function CustomerOnboardingFlow({ state, dispatch, firstName, events, saving, saveError, onFinish }: FlowProps) {
  if (!state.hydrated) return <FlowSkeleton />;

  const goto = (step: number) => dispatch({ type: "goto", step });
  const onPreferenceStep = state.step === PREFERENCE_STEP;
  const ready = state.step === 1 ? state.selection !== null
    : state.step === 2 ? state.interests.length >= MIN_INTERESTS
      : true;

  const primary = onPreferenceStep ? (
    <Button size="lg" loading={saving} onClick={() => onFinish(state.preference)}>Finish</Button>
  ) : (
    <Button size="lg" disabled={!ready} onClick={() => goto(state.step + 1)}>
      {state.step === 0 ? "Get started" : "Continue"} <ArrowRight />
    </Button>
  );

  const secondary = onPreferenceStep ? (
    <Button variant="ghost" size="lg" disabled={saving} onClick={() => onFinish(null)}>Skip</Button>
  ) : null;

  return (
    // Nothing is editable while the answers are in flight, Back included: the record being written
    // is the one the confirmation panel is about to describe. Back returns if the save fails.
    <OnboardingShell
      {...progressFor(state.step)}
      onBack={saving ? undefined : () => goto(state.step - 1)}
      primary={primary}
      secondary={secondary}
    >
      {saveError ? (
        <p role="alert" className="mb-5 rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {saveError}
        </p>
      ) : null}

      {state.step === 0 ? (
        <StepWelcome firstName={firstName} events={events} />
      ) : state.step === 1 ? (
        <StepLocation
          selection={state.selection}
          onSelect={(selection) => dispatch({ type: "selectLocation", selection })}
          events={events}
          disabled={saving}
        />
      ) : state.step === 2 ? (
        <StepInterests
          value={state.interests}
          onChange={(interests) => dispatch({ type: "setInterests", interests })}
          disabled={saving}
        />
      ) : (
        <StepPreference
          value={state.preference}
          onSelect={(preference) => dispatch({ type: "setPreference", preference })}
          disabled={saving}
        />
      )}
    </OnboardingShell>
  );
}

/** Held for the one frame it takes to read the saved draft, so answers never flash past. */
function FlowSkeleton() {
  return (
    <OnboardingShell step={0} total={CORE_STEPS} primary={<Button size="lg" disabled>Get started</Button>}>
      <div aria-busy="true" aria-label="Opening onboarding">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="mt-3 h-4 w-2/3" />
        <div className="mt-8 grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      </div>
    </OnboardingShell>
  );
}
