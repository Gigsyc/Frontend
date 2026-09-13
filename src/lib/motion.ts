"use client";

import type { MotionProps } from "motion/react";
import { useEffect, useState } from "react";

/** The house easing. Every entrance in the product uses this curve — see DESIGN.md. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Stagger the first paint of a list only. Re-renders caused by filtering, refetching or a
 * status change render in place — a table that re-animates on every keystroke reads as broken.
 *
 * 30ms per item, capped at the eighth so a long list never crawls.
 */
export function useStaggerOnce(ready: boolean): (index: number) => MotionProps {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!ready || done) return;
    const t = window.setTimeout(() => setDone(true), 450);
    return () => window.clearTimeout(t);
  }, [ready, done]);
  // Once the entrance is over, the element must still be told where it rests. Returning
  // only `initial: false` leaves motion holding whatever inline style it last wrote, which
  // can strand a row at opacity 0 if the timer wins the race against the animation.
  return (index: number) =>
    done
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, ease: EASE, delay: Math.min(index, 8) * 0.03 },
        };
}
