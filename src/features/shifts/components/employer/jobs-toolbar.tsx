"use client";

import { Search, X } from "lucide-react";
import { Input, Segmented, Select } from "@/components/ui";
import { JOB_SORTS, STATUS_FILTERS, type JobSort, type JobsFilterState, type JobsQuery, type StatusFilter } from "./jobs-filters";

interface JobsToolbarProps {
  query: JobsQuery;
  counts: Record<StatusFilter, number>;
  onChange: (patch: Partial<JobsFilterState>) => void;
  resultCount: number;
}

export function JobsToolbar({ query, counts, onChange, resultCount }: JobsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-xs">
          <Input
            type="search"
            aria-label="Search shifts by title or venue"
            placeholder="Search title or venue"
            value={query.search}
            onChange={(e) => onChange({ search: e.target.value })}
            leading={<Search aria-hidden />}
            className="pr-11"
            trailing={query.search ? (
              // size-9 keeps it inside the 40px field; the pseudo-element takes the tap target to 44px on touch.
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onChange({ search: "" })}
                className="relative inline-flex size-9 items-center justify-center rounded-sm text-fg-muted after:absolute after:-inset-1 after:content-[''] hover:bg-ink-100 hover:text-fg"
              >
                <X />
              </button>
            ) : undefined}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-fg-muted tabular sm:block">{resultCount} {resultCount === 1 ? "shift" : "shifts"}</span>
          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <Select aria-label="Sort shifts" value={query.sort} onChange={(e) => onChange({ sort: e.target.value as JobSort })} className="w-48">
              {JOB_SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </label>
        </div>
      </div>
      <div className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Segmented
          ariaLabel="Filter by status"
          value={query.status}
          onChange={(status) => onChange({ status })}
          options={STATUS_FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
        />
      </div>
    </div>
  );
}
