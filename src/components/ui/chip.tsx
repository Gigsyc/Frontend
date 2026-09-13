"use client";

import { Check, X } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onRemove?: () => void;
}

/** Toggleable filter chip. Use for multi-select filters (roles, districts). */
export function Chip({ selected, onRemove, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[13px] font-medium transition-colors",
        selected ? "border-navy-900 bg-navy-900 text-white" : "border-border-strong bg-surface text-fg hover:border-ink-400 hover:bg-ink-50",
        className,
      )}
      {...props}
    >
      {selected ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : null}
      {children}
      {onRemove ? (
        <span role="button" aria-label="Remove" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="-mr-1 inline-flex size-4 items-center justify-center rounded-full hover:bg-white/20">
          <X className="size-3" />
        </span>
      ) : null}
    </button>
  );
}
