"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number; // 0–5
  count?: number;
  size?: "sm" | "md";
  className?: string;
  showValue?: boolean;
}

/** Compact rating display: one star + number, optionally count. Five-star rows are noisy in lists. */
export function Rating({ value, count, size = "sm", className, showValue = true }: RatingProps) {
  if (!count && value === 0) return <span className={cn("text-fg-subtle", size === "sm" ? "text-xs" : "text-sm", className)}>No ratings yet</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 tabular", size === "sm" ? "text-xs" : "text-sm", className)} aria-label={`Rated ${value.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ""}`}>
      <Star className={cn("fill-amber-500 text-amber-500", size === "sm" ? "size-3.5" : "size-4")} aria-hidden />
      {showValue ? <span className="font-semibold text-fg">{value.toFixed(1)}</span> : null}
      {typeof count === "number" ? <span className="text-fg-muted">({count})</span> : null}
    </span>
  );
}

/** Interactive 5-star input for review forms. */
export function StarInput({ value, onChange, label, size = "md", disabled }: { value: number; onChange: (v: number) => void; label: string; size?: "md" | "lg"; disabled?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(null)}
          onClick={() => onChange(n)}
          className="rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed"
        >
          <Star className={cn(size === "lg" ? "size-8" : "size-6", n <= shown ? "fill-amber-500 text-amber-500" : "fill-ink-100 text-ink-300", "transition-colors")} />
        </button>
      ))}
    </div>
  );
}
