"use client";

import { addDays, format, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import type { DayMarker } from "../types";

interface WeekStripProps {
  markers: Record<string, DayMarker>;
  onSelect: (date: string, marker: DayMarker) => void;
}

/** Seven days from today. A dot marks days with something booked; tapping jumps to it. */
export function WeekStrip({ markers, onSelect }: WeekStripProps) {
  const start = startOfToday();
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div role="group" aria-label="Next seven days" className="grid grid-cols-7 gap-1.5">
      {days.map((d, i) => {
        const key = format(d, "yyyy-MM-dd");
        const marker = markers[key];
        const today = i === 0;
        const cls = cn(
          "flex min-h-[60px] flex-col items-center justify-center gap-0.5 rounded-md py-2 text-xs transition-colors",
          today ? "bg-navy-900 text-white" : marker ? "bg-surface text-fg shadow-card hover:bg-ink-50" : "text-fg-subtle",
        );
        const inner = (
          <>
            <span className={cn("text-[10px] font-medium uppercase tracking-wide", today ? "text-white/70" : "")}>{format(d, "EEE")}</span>
            <span className="font-display text-base font-semibold leading-tight tabular">{format(d, "d")}</span>
            <span
              className={cn("size-1.5 rounded-full", marker === "confirmed" ? "bg-amber-500" : marker === "pending" ? (today ? "bg-white/50" : "bg-ink-400") : "bg-transparent")}
              aria-hidden
            />
          </>
        );
        const label = `${format(d, "EEEE d MMMM")}${marker === "confirmed" ? ", confirmed shift" : marker === "pending" ? ", awaiting a reply" : ""}`;
        return marker ? (
          <button key={key} type="button" onClick={() => onSelect(key, marker)} aria-label={label} className={cls}>{inner}</button>
        ) : (
          <div key={key} aria-label={label} className={cls}>{inner}</div>
        );
      })}
    </div>
  );
}
