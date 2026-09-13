"use client";

import { MapPin } from "lucide-react";
import { OnboardingHeading, SelectTile } from "@/components/layout/onboarding-shell";
import { PLACES } from "@/data/events";
import type { Action, PartnerOnboardingState, StepErrors } from "../lib/state";
import { TileGroup } from "./tile-group";

interface StepProps {
  state: PartnerOnboardingState;
  errors: StepErrors;
  dispatch: (action: Action) => void;
}

export function StepLocation({ state, errors, dispatch }: StepProps) {
  return (
    <>
      <OnboardingHeading
        title="Where do you operate?"
        description="Your main city. You can list events anywhere."
      />
      <TileGroup label="Main city" error={errors.place} columns={2}>
        {PLACES.map((place) => (
          <SelectTile
            key={place}
            role="radio"
            selected={state.place === place}
            icon={<MapPin aria-hidden />}
            label={place}
            onClick={() => dispatch({ type: "patch", patch: { place } })}
          />
        ))}
      </TileGroup>
    </>
  );
}
