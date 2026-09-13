"use client";

import { Chip } from "@/components/ui/chip";
import { WHEN_OPTIONS } from "@/data/events";
import type { WhenValue } from "../../hooks";

interface DateRailProps {
  value: WhenValue;
  onChange: (v: WhenValue) => void;
  /** Counts from the unfiltered list; omitted while it is still loading. */
  counts?: Record<WhenValue, number>;
}

/** Horizontal date rail. Scrolls on mobile with a bleed into the page gutter. */
export function DateRail({ value, onChange, counts }: DateRailProps) {
  return (
    <div
      role="group"
      aria-label="Filter by date"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0"
    >
      {WHEN_OPTIONS.map((option) => {
        const count = counts?.[option.value];
        return (
          <Chip
            key={option.value}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            className="h-11 shrink-0 px-4 sm:h-9 sm:px-3.5"
          >
            {option.label}
            {typeof count === "number" && option.value !== "all" ? (
              <span className="tabular text-xs opacity-70">{count}</span>
            ) : null}
          </Chip>
        );
      })}
    </div>
  );
}
