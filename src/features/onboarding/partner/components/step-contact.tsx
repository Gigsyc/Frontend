"use client";

import { OnboardingHeading } from "@/components/layout/onboarding-shell";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { groupPhone, phoneDigits, type Action, type PartnerOnboardingState, type StepErrors } from "../lib/state";

interface StepProps {
  state: PartnerOnboardingState;
  errors: StepErrors;
  dispatch: (action: Action) => void;
  onBlurField: () => void;
  /** The signed-in account's address. Shown, never edited here. */
  accountEmail: string;
}

export function StepContact({ state, errors, dispatch, onBlurField, accountEmail }: StepProps) {
  return (
    <>
      <OnboardingHeading
        title="Who should we contact?"
        description="Only GigSyc sees this. It is not shown on your public events."
      />
      <div className="flex flex-col gap-5">
        <Field label="Contact name" required error={errors.contactName}>
          {(p) => (
            <Input
              {...p}
              name="contactName"
              autoComplete="name"
              placeholder="Diane Mukamana"
              value={state.contactName}
              onChange={(e) => dispatch({ type: "patch", patch: { contactName: e.target.value } })}
              onBlur={onBlurField}
              className="h-11"
            />
          )}
        </Field>

        <Field label="Email" hint="This is your account email">
          {(p) => (
            <Input
              {...p}
              type="email"
              name="email"
              autoComplete="email"
              value={accountEmail}
              readOnly
              className="h-11 bg-ink-50 text-fg-muted"
            />
          )}
        </Field>

        <Field label="Phone" required error={errors.phone}>
          {(p) => (
            <Input
              {...p}
              type="tel"
              inputMode="numeric"
              name="phone"
              autoComplete="tel-national"
              placeholder="788 123 456"
              value={groupPhone(state.phone)}
              onChange={(e) => dispatch({ type: "patch", patch: { phone: phoneDigits(e.target.value) } })}
              onBlur={onBlurField}
              leading={<span className="text-sm font-medium text-fg-muted">+250</span>}
              className="h-11 pl-14"
            />
          )}
        </Field>
      </div>
    </>
  );
}
