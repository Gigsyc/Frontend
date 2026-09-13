"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import {
  ROLE_OPTIONS, STATUS_OPTIONS,
  type RoleFilter, type StatusFilter, type UserFilterState,
} from "./use-user-filters";

interface Props {
  state: UserFilterState;
  onChange: (patch: Partial<UserFilterState>) => void;
}

export function UsersToolbar({ state, onChange }: Props) {
  const [text, setText] = useState(state.query);

  useEffect(() => {
    if (text === state.query) return;
    const t = setTimeout(() => onChange({ query: text }), 250);
    return () => clearTimeout(t);
    // Only typing re-arms the timer; the URL catching up must not cancel a pending write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

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
