"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, Input, Segmented, Select } from "@/components/ui";
import { CATEGORY_LIST, PLACES } from "@/data/events";
import { pluralize } from "@/lib/utils";
import type { EventCategory, RwandaPlace } from "@/types";
import {
  ADMIN_EVENT_SORTS, STATUS_TABS,
  type AdminEventFilterState, type AdminEventSort, type StatusTab,
} from "../../hooks/use-admin-event-params";
import { useDebouncedValue } from "../../hooks/use-debounced-value";

interface Props {
  state: AdminEventFilterState;
  counts?: Record<StatusTab, number>;
  onChange: (patch: Partial<AdminEventFilterState>) => void;
  onClear: () => void;
  activeCount: number;
  resultCount?: number;
}

/**
 * Status tabs carry the queue, the row below narrows it. Typing is debounced so the URL —
 * and the query behind it — changes once per word, not once per keystroke.
 */
export function EventsToolbar({ state, counts, onChange, onClear, activeCount, resultCount }: Props) {
  const [text, setText] = useState(state.q);
  const debounced = useDebouncedValue(text, 250);
  const pushed = useRef(state.q);

  useEffect(() => {
    if (debounced === pushed.current) return;
    pushed.current = debounced;
    onChange({ q: debounced });
  }, [debounced, onChange]);

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5">
      <div className="scrollbar-none -mx-1 overflow-x-auto px-1 pb-0.5">
        <Segmented<StatusTab>
          ariaLabel="Filter events by status"
          size="sm"
          value={state.status}
          onChange={(status) => onChange({ status })}
          options={STATUS_TABS.map((t) => ({ ...t, count: counts?.[t.value] }))}
        />
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          leading={<Search />}
          type="search"
          aria-label="Search events"
          placeholder="Title, venue, place or organiser"
          className="lg:max-w-72"
          trailing={text ? (
            <Button variant="ghost" size="icon-sm" aria-label="Clear search" onClick={() => setText("")}><X /></Button>
          ) : undefined}
        />
        <div className="grid grid-cols-2 gap-2 lg:ml-auto lg:flex lg:shrink-0">
          <Select
            aria-label="Filter by category"
            value={state.category}
            onChange={(e) => onChange({ category: e.target.value === "" ? "" : (e.target.value as EventCategory) })}
            className="lg:w-40"
          >
            <option value="">All categories</option>
            {CATEGORY_LIST.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
          <Select
            aria-label="Filter by place"
            value={state.place}
            onChange={(e) => onChange({ place: e.target.value === "" ? "" : (e.target.value as RwandaPlace) })}
            className="lg:w-36"
          >
            <option value="">All places</option>
            {PLACES.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Select
            aria-label="Sort events"
            value={state.sort}
            onChange={(e) => onChange({ sort: e.target.value as AdminEventSort })}
            className="col-span-2 lg:w-48"
          >
            {ADMIN_EVENT_SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
      </div>

      {resultCount !== undefined ? (
        <div className="flex min-h-8 items-center justify-between gap-3 text-[13px] text-fg-muted">
          <span className="tabular">{pluralize(resultCount, "event")}</span>
          {activeCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => { setText(""); onClear(); }}>
              <X /> Clear filters
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
