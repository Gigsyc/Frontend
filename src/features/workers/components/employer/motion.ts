"use client";

import { useEffect, useState } from "react";

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * True while a list is entering for the first time, false afterwards — so refetches and
 * filter changes swap content in place instead of re-running the stagger.
 */
export function useEntranceOnce(ready: boolean) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!ready || done) return;
    const t = window.setTimeout(() => setDone(true), 500);
    return () => window.clearTimeout(t);
  }, [ready, done]);
  return ready && !done;
}

/** Props for a staggered list item: 0.03s per item, capped at the 8th. */
export function staggerItem(index: number, animate: boolean) {
  return {
    initial: animate ? { opacity: 0, y: 6 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: EASE_OUT, delay: Math.min(index, 8) * 0.03 },
  };
}
