"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import {
  ROLE_OPTIONS, STATUS_OPTIONS,
  type RoleFilter, type StatusFilter, type UserFilterState,
} from "./use-user-filters";

interface Props {
  state: UserFilterState;
  onChange: (patch: Partial<UserFilterState>) => void;
}

/**
 * Typing debounces to one URL write per word. `onChange` stays in the deps so the write always
 * carries the role and status that are current when it fires, not the ones captured mid-keystroke.
 */
export function UsersToolbar({ state, onChange }: Props) {
  const [text, setText] = useState(state.query);
  const debounced = useDebouncedValue(text, 250);
  const pushed = useRef(state.query);

  useEffect(() => {
    if (debounced === pushed.current) return;
    pushed.current = debounced;
    onChange({ query: debounced });
  }, [debounced, onChange]);

  // The URL is the source of truth: "Clear filters" and the back button mirror back into the box.
  useEffect(() => {
    if (state.query === pushed.current) return;
    pushed.current = state.query;
    setText(state.query);
  }, [state.query]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="sm:max-w-xs sm:flex-1">
        <label htmlFor="admin-user-search" className="sr-only">Search users</label>
        <Input
          id="admin-user-search"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Name or email"
          autoComplete="off"
          leading={<Search aria-hidden />}
          trailing={
            text ? (
              <button type="button" onClick={() => setText("")} aria-label="Clear search" className="inline-flex size-7 items-center justify-center rounded-sm text-fg-muted hover:bg-ink-100 hover:text-fg">
                <X />
              </button>
            ) : null
          }
        />
      </div>
      <div className="flex gap-3">
        <label htmlFor="admin-user-role" className="sr-only">Role</label>
        <Select id="admin-user-role" className="w-full sm:w-44" value={state.role} onChange={(e) => onChange({ role: e.target.value as RoleFilter })}>
          {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <label htmlFor="admin-user-status" className="sr-only">Status</label>
        <Select id="admin-user-status" className="w-full sm:w-44" value={state.status} onChange={(e) => onChange({ status: e.target.value as StatusFilter })}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </div>
    </div>
  );
}
