"use client";

import { OnboardingHeading } from "@/components/layout/onboarding-shell";
import { pluralize } from "@/lib/utils";
import type { InterestId } from "@/types";
import { InterestPicker } from "../interest-picker";
import { MIN_INTERESTS } from "../state";

interface StepInterestsProps {
  value: InterestId[];
  onChange: (next: InterestId[]) => void;
  disabled?: boolean;
}

export function StepInterests({ value, onChange, disabled }: StepInterestsProps) {
  const remaining = MIN_INTERESTS - value.length;

  return (
    <div>
      <OnboardingHeading
        title="What are you interested in?"
        description="Pick at least three. This shapes what we show you first."
      />

      <InterestPicker
        value={value}
        onChange={onChange}
        label="What are you interested in?"
        disabled={disabled}
      />

      <p aria-live="polite" className="mt-4 text-sm text-fg-muted">
        <span className="font-medium tabular text-fg">{value.length} selected</span>
        {remaining > 0 ? ` · ${pluralize(remaining, "more", "more")} to go` : null}
      </p>
    </div>
  );
}
