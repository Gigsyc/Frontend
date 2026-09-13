"use client";

import { useEffect, useState } from "react";

/**
 * Debounced mirror of a fast-changing value. Search boxes use 250ms: long enough that a
 * typed word is one query, short enough that the table never feels stuck.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
