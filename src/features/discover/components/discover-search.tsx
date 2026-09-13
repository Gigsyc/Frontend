"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/tabs";
import { DATE_OPTIONS, type DateRange } from "../filters";

interface DiscoverSearchProps {
  query: string;
  onQuery: (q: string) => void;
  dateRange: DateRange;
  onDateRange: (d: DateRange) => void;
}

/** Search box (debounced 250ms) and the date segmented control. Remounted by the parent on "clear". */
export function DiscoverSearch({ query, onQuery, dateRange, onDateRange }: DiscoverSearchProps) {
  const [text, setText] = useState(query);

  useEffect(() => {
    if (text === query) return;
    const t = setTimeout(() => onQuery(text), 250);
    return () => clearTimeout(t);
    // Only the typed text should re-arm the timer; `query` catching up must not cancel a pending write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="space-y-3">
      <label htmlFor="discover-search" className="sr-only">Search shifts</label>
      <Input
        id="discover-search"
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Role, venue or employer"
        autoComplete="off"
        enterKeyHint="search"
        leading={<Search aria-hidden />}
        trailing={
          text ? (
            <button type="button" onClick={() => setText("")} aria-label="Clear search" className="inline-flex size-7 items-center justify-center rounded-sm text-fg-muted hover:bg-ink-100 hover:text-fg">
              <X />
            </button>
          ) : null
        }
      />
      <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
        <Segmented ariaLabel="When" value={dateRange} onChange={onDateRange} options={DATE_OPTIONS} />
      </div>
    </div>
  );
}
