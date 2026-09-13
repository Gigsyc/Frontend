"use client";

import { SlidersHorizontal, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ROLE_LIST, ROLES } from "@/data/roles";
import type { RoleCategory } from "@/types";
import { effectiveRoles, toggleForYou, toggleRole, type DiscoverState } from "../filters";

interface RoleChipRowProps {
  state: DiscoverState;
  skills: RoleCategory[];
  filterCount: number;
  onChange: (patch: Partial<DiscoverState>) => void;
  onOpenFilters: () => void;
}

/** Horizontal scroller: Filters button, "For you", then role chips with the worker's own skills first. */
export function RoleChipRow({ state, skills, filterCount, onChange, onOpenFilters }: RoleChipRowProps) {
  const ordered = useMemo(() => {
    const rest = ROLE_LIST.map((r) => r.id).filter((id) => !skills.includes(id));
    return [...skills, ...rest];
  }, [skills]);
  const active = effectiveRoles(state, skills);

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0" role="group" aria-label="Filter by role">
      <Button variant="outline" size="sm" className="shrink-0 rounded-full" onClick={onOpenFilters} aria-label={filterCount ? `Filters, ${filterCount} active` : "Filters"}>
        <SlidersHorizontal /> Filters
        {filterCount ? <span className="-mr-1 inline-flex min-w-5 items-center justify-center rounded-full bg-navy-900 px-1.5 text-[11px] font-semibold leading-5 text-white tabular">{filterCount}</span> : null}
      </Button>
      {skills.length ? (
        <Chip selected={state.forYou} onClick={() => onChange(toggleForYou(state))} className="shrink-0">
          {!state.forYou ? <Sparkles className="size-3.5 text-amber-600" aria-hidden /> : null} For you
        </Chip>
      ) : null}
      {ordered.map((id) => (
        <Chip key={id} selected={active.includes(id)} onClick={() => onChange(toggleRole(state, id, skills))} className="shrink-0">
          {ROLES[id].short}
        </Chip>
      ))}
    </div>
  );
}
