"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Settings on the admin console are demo-only: there is no store method behind them. The save
 * still takes a beat and confirms, so the button's pending state behaves like the real thing.
 */
export function useSimulatedSave(description: string) {
  const [saving, setSaving] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const save = useCallback(() => {
    setSaving(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setSaving(false);
      toast.success("Settings saved", { description });
    }, 600);
  }, [description]);

  return { saving, save };
}
