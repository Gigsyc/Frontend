"use client";

import { Globe2, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { OnboardingHeading } from "@/components/layout/onboarding-shell";
import { Button } from "@/components/ui/button";
import { PLACES } from "@/data/events";
import { pluralize } from "@/lib/utils";
import type { RwandaPlace } from "@/types";
import type { EventsSummary, LocationChoice } from "../state";
import { EventsRetry } from "./events-retry";
import { TileRadioGroup, type TileOption } from "./tile-radio-group";

interface StepLocationProps {
  selection: LocationChoice | null;
  onSelect: (selection: LocationChoice) => void;
  events: EventsSummary;
  disabled?: boolean;
}

const QUESTION = "Where are you exploring?";

export function StepLocation({ selection, onSelect, events, disabled }: StepLocationProps) {
  const counts = new Map<RwandaPlace, number>();
  for (const event of events.list ?? []) counts.set(event.place, (counts.get(event.place) ?? 0) + 1);

  /** A count, a skeleton, or nothing at all — never a number we can't stand behind. */
  const describe = (place: RwandaPlace): ReactNode => {
    if (events.pending) return <span className="skeleton mt-1 block h-3 w-20" aria-hidden />;
    if (!events.list) return null;
    const n = counts.get(place) ?? 0;
    return n === 0 ? "Nothing on right now" : pluralize(n, "event");
  };

  const options: TileOption<LocationChoice>[] = [
    ...PLACES.map((place) => ({
      value: place as LocationChoice,
      label: place,
      description: describe(place),
      icon: <MapPin />,
    })),
    {
      value: "anywhere" as LocationChoice,
      label: "Somewhere else",
      description: "We'll show you everything for now.",
      icon: <Globe2 />,
      className: "sm:col-span-2",
    },
  ];

  // No geolocation is requested and none is implied: this is a shortcut to Kigali, said plainly.
  const useCurrentLocation = () => {
    onSelect("Kigali");
    toast.success("Set to Kigali", { description: "Real location detection comes later." });
  };

  return (
    <div>
      <OnboardingHeading
        title={QUESTION}
        description="We'll put events near you first. You can change this any time."
      />

      <TileRadioGroup
        label={QUESTION}
        options={options}
        value={selection}
        onSelect={onSelect}
        required
        disabled={disabled}
        className="sm:grid-cols-2"
      />

      {events.error ? (
        <EventsRetry
          message="We couldn't load how many events each place has."
          onRetry={events.retry}
          disabled={disabled}
        />
      ) : null}

      <Button variant="ghost" size="lg" className="mt-4 -ml-3 px-3" disabled={disabled} onClick={useCurrentLocation}>
        <MapPin /> Use my current location
      </Button>
    </div>
  );
}
