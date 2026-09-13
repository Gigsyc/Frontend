"use client";

import { useCallback, useState } from "react";

/**
 * Drives a dialog that acts on one item from a list (invite this worker, remove that one).
 * The target survives closing so the dialog stays mounted and Radix can run its exit
 * animation; `show()` swaps the target and opens in one step.
 */
export function useDialogTarget<T>() {
  const [target, setTarget] = useState<T | null>(null);
  const [open, setOpen] = useState(false);
  const show = useCallback((next: T) => {
    setTarget(next);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  return { target, open, show, close, onOpenChange: setOpen };
}
