"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface EventsSearchProps {
  query: string;
  onQuery: (q: string) => void;
  className?: string;
}

/**
 * Debounced 250ms so typing doesn't rewrite the URL on every keystroke, and two-way: a `q` that
 * changes from outside — the search chip removed, "Clear all", back/forward, a deep link — is
 * pulled back into the box instead of leaving stale text that the next keystroke would re-apply.
 */
export function EventsSearch({ query, onQuery, className }: EventsSearchProps) {
  const [text, setText] = useState(query);
  const sent = useRef(query);

  useEffect(() => {
    if (text === query) return;
    const t = setTimeout(() => {
      sent.current = text;
      onQuery(text);
    }, 250);
    return () => clearTimeout(t);
    // Only typed text re-arms the timer; the URL catching up must not cancel a pending write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    if (query === sent.current) return;
    sent.current = query;
    setText(query);
  }, [query]);

  return (
    <div className={className}>
      <label htmlFor="events-search" className="sr-only">Search events</label>
      <Input
        id="events-search"
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search events, venues or organisers"
        autoComplete="off"
        enterKeyHint="search"
        className="[&::-webkit-search-cancel-button]:appearance-none"
        leading={<Search aria-hidden />}
        trailing={
          text ? (
            <button
              type="button"
              onClick={() => setText("")}
              aria-label="Clear search"
              className="inline-flex size-7 items-center justify-center rounded-sm text-fg-muted hover:bg-ink-100 hover:text-fg"
            >
              <X />
            </button>
          ) : null
        }
      />
    </div>
  );
}
