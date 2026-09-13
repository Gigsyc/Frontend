"use client";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { activeFilterChips, type EventsFilterState } from "../../hooks";

interface ActiveFiltersProps {
  state: EventsFilterState;
  onChange: (patch: Partial<EventsFilterState>) => void;
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
        <Chip key={chip.key} selected onRemove={() => onChange(chip.patch)} onClick={() => onChange(chip.patch)} className="h-8">
          {chip.label}
        </Chip>
      ))}
      {chips.length > 1 ? (
        <Button variant="link" size="sm" onClick={onClear} className="h-8">Clear all</Button>
      ) : null}
    </div>
  );
}
