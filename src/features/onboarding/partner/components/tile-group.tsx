"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A labelled radio group of `SelectTile`s. The tiles carry `role="radio"`, so the group
 * needs the matching `role="radiogroup"` and the error has to be announced against it.
 */
export function TileGroup({ label, error, columns = 1, children, className }: {
  label: string;
  error?: string;
  columns?: 1 | 2;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <p id={`${id}-label`} className="mb-2.5 text-sm font-medium text-fg">{label}</p>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-describedby={errorId}
        aria-invalid={error ? true : undefined}
        className={cn("grid gap-3", columns === 2 && "sm:grid-cols-2")}
      >
        {children}
      </div>
      {error ? <p id={errorId} role="alert" className="mt-2 text-[13px] text-danger-600">{error}</p> : null}
    </div>
  );
}
