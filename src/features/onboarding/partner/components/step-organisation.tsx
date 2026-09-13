"use client";

import {
  BedDouble, Drama, Landmark, PartyPopper, Route, Sparkles, UtensilsCrossed, type LucideIcon,
} from "lucide-react";
import { OnboardingHeading, SelectTile } from "@/components/layout/onboarding-shell";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ORGANIZATION_TYPE_LIST } from "@/data/auth";
import type { OrganizationType } from "@/types";
import type { Action, PartnerOnboardingState, StepErrors } from "../lib/state";
import { TileGroup } from "./tile-group";

/** `ORGANIZATION_TYPES` names its icon; the UI layer resolves it, as with roles and categories. */
const ICONS: Record<OrganizationType, LucideIcon> = {
  event_organizer: PartyPopper,
  tour_operator: Route,
  hotel: BedDouble,
  restaurant: UtensilsCrossed,
  experience_provider: Sparkles,
  cultural_organization: Drama,
  attraction: Landmark,
};

interface StepProps {
  state: PartnerOnboardingState;
  errors: StepErrors;
  dispatch: (action: Action) => void;
  onBlurField: () => void;
}

export function StepOrganisation({ state, errors, dispatch, onBlurField }: StepProps) {
  return (
    <>
      <OnboardingHeading
        title="Tell us about your organisation"
        description="This is what people will see on your events."
      />
      <div className="flex flex-col gap-7">
        <Field label="Organisation name" required error={errors.organizationName}>
          {(p) => (
            <Input
              {...p}
              name="organization"
              autoComplete="organization"
              placeholder="Ikaze Hospitality Group"
              value={state.organizationName}
              onChange={(e) => dispatch({ type: "patch", patch: { organizationName: e.target.value } })}
              onBlur={onBlurField}
              className="h-11"
            />
          )}
        </Field>

        <TileGroup label="What kind of organisation is it?" error={errors.organizationType} columns={2}>
          {ORGANIZATION_TYPE_LIST.map((type) => {
            const Icon = ICONS[type.id];
            return (
              <SelectTile
                key={type.id}
                role="radio"
                selected={state.organizationType === type.id}
                icon={<Icon aria-hidden />}
                label={type.label}
                description={type.description}
                className="items-start"
                onClick={() => dispatch({ type: "patch", patch: { organizationType: type.id } })}
              />
            );
          })}
        </TileGroup>
      </div>
    </>
  );
}
