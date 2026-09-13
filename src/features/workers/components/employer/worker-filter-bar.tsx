"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SwitchField } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { DISTRICTS, ROLE_LIST } from "@/data/roles";
import type { RoleCategory } from "@/types";
import { MIN_RATINGS, WORKER_SORTS, isDistrict, isSort, type WorkerFilterState } from "./use-worker-filter-params";

interface Props {
  state: WorkerFilterState;
  activeCount: number;
  onChange: (patch: Partial<WorkerFilterState>) => void;
  onClear: () => void;
}

export function WorkerFilterBar({ state, activeCount, onChange, onClear }: Props) {
  // Local query so typing is instant; the URL follows after a short pause.
  const [q, setQ] = useState(state.q);
  const [pushedQ, setPushedQ] = useState(state.q);
  const [seenUrlQ, setSeenUrlQ] = useState(state.q);
  if (state.q !== seenUrlQ) {
    // URL changed — from Clear, back/forward or a pasted link. Only adopt it if we didn't push it ourselves.
    setSeenUrlQ(state.q);
    if (state.q !== pushedQ) setQ(state.q);
  }
  useEffect(() => {
    if (q.trim() === state.q.trim()) return;
    const t = window.setTimeout(() => {
      setPushedQ(q.trim());
      onChange({ q });
    }, 250);
    return () => window.clearTimeout(t);
  }, [q, state.q, onChange]);

  const toggleRole = (role: RoleCategory) =>
    onChange({ roles: state.roles.includes(role) ? state.roles.filter((r) => r !== role) : [...state.roles, role] });

  return (
    <div className="space-y-4 rounded-lg bg-surface p-4 shadow-card">
      <Input
        type="search"
        leading={<Search aria-hidden />}
        placeholder="Search by name, skill or district"
        aria-label="Search professionals"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div role="group" aria-label="Roles" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {/* min-h-11 gives the chips a 44px touch target on phones; sm and up keeps the compact 32px row. */}
        {ROLE_LIST.map((r) => (
          <Chip key={r.id} selected={state.roles.includes(r.id)} onClick={() => toggleRole(r.id)} className="min-h-11 shrink-0 sm:min-h-8">
            {r.short}
          </Chip>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <Field label="District" className="md:w-44">
          {(p) => (
            <Select {...p} value={state.district} onChange={(e) => onChange({ district: isDistrict(e.target.value) ? e.target.value : "" })}>
              <option value="">All of Kigali</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Minimum rating" className="md:w-40">
          {(p) => (
            <Select {...p} value={String(state.minRating)} onChange={(e) => onChange({ minRating: Number(e.target.value) })}>
              {MIN_RATINGS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Sort by" className="md:w-44">
          {(p) => (
            <Select {...p} value={state.sort} onChange={(e) => onChange({ sort: isSort(e.target.value) ? e.target.value : "best_match" })}>
              {WORKER_SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          )}
        </Field>
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-2 md:ml-auto">
          <SwitchField label="Fully verified only" checked={state.verifiedOnly} onCheckedChange={(v) => onChange({ verifiedOnly: v })} />
          {activeCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={onClear}><X /> Clear filters</Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
