"use client";

import { CalendarDays, Map, MapPin, Route, Sparkles, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { OnboardingHeading } from "@/components/layout/onboarding-shell";
import { DISCOVERY_PREFERENCE_LIST } from "@/data/auth";
import type { DiscoveryPreferenceId } from "@/types";
import { TileRadioGroup, type TileOption } from "./tile-radio-group";

/** The data names its icon; the UI layer is where a name becomes a component. */
const ICONS: Record<DiscoveryPreferenceId, LucideIcon> = {
  near_me: MapPin,
  places: Map,
  weekends: CalendarDays,
  trips: Route,
  food_culture: UtensilsCrossed,
  everything: Sparkles,
};

interface StepPreferenceProps {
  value: DiscoveryPreferenceId | null;
  onSelect: (preference: DiscoveryPreferenceId) => void;
  disabled?: boolean;
}

const QUESTION = "What are you usually looking for?";

export function StepPreference({ value, onSelect, disabled }: StepPreferenceProps) {
  const options: TileOption<DiscoveryPreferenceId>[] = DISCOVERY_PREFERENCE_LIST.map((preference) => {
    const Icon = ICONS[preference.id];
    return {
      value: preference.id,
      label: preference.label,
      description: preference.description,
      icon: <Icon />,
    };
  });

  return (
    <div>
      <OnboardingHeading
        title={QUESTION}
        description="Optional — it helps us order things. Skip if you'd rather just browse."
      />

      <TileRadioGroup label={QUESTION} options={options} value={value} onSelect={onSelect} disabled={disabled} />
    </div>
  );
}
