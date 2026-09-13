"use client";

import { Chip } from "@/components/ui/chip";
import { categoryIcon } from "@/components/common/category-icon";
import { CATEGORY_LIST } from "@/data/events";
import type { EventCategory } from "@/types";

interface CategoryRailProps {
  selected: EventCategory[];
  onChange: (next: EventCategory[]) => void;
}

/** Compact multi-select chip rail. "All" clears back to everything. */
export function CategoryRail({ selected, onChange }: CategoryRailProps) {
  const toggle = (id: EventCategory) =>
    onChange(selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id]);

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0"
    >
      <Chip selected={selected.length === 0} onClick={() => onChange([])} className="h-11 shrink-0 px-4 sm:h-9 sm:px-3.5">
        All
      </Chip>
      {CATEGORY_LIST.map((category) => {
        const Icon = categoryIcon(category.id);
        const on = selected.includes(category.id);
        return (
          <Chip key={category.id} selected={on} onClick={() => toggle(category.id)} className="h-11 shrink-0 px-4 sm:h-9 sm:px-3.5">
            {!on ? <Icon className="size-3.5 text-navy-700" aria-hidden /> : null}
            {category.label}
          </Chip>
        );
      })}
    </div>
  );
}
