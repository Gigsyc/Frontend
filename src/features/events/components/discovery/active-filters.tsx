"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { activeFilterChips, type EventsFilterPatch, type EventsFilterState } from "../../hooks";

interface ActiveFiltersProps {
  state: EventsFilterState;
  onChange: (patch: EventsFilterPatch) => void;
  onClear: () => void;
}

/** What's currently narrowing the board, each removable. "Clear all" appears once two are on. */
export function ActiveFilters({ state, onChange, onClear }: ActiveFiltersProps) {
  const chips = activeFilterChips(state);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[13px] text-fg-muted">Active filters</span>
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          selected
          onClick={() => onChange(chip.patch)}
          aria-label={`Remove ${chip.label} filter`}
          className="h-8"
        >
          {chip.label}
          <X className="-mr-0.5 size-3" aria-hidden />
        </Chip>
      ))}
      {chips.length > 1 ? (
        <Button variant="link" size="sm" onClick={onClear} className="h-8">Clear all</Button>
      ) : null}
    </div>
  );
}
