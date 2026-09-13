"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

/**
 * Featured is the one property an operations person flips from the list, so it gets a real
 * toggle rather than a trip into the ⋯ menu. Amber, because featured is about what leads /events.
 */
export function FeaturedToggle({ event, onToggle, busy, className }: {
  event: Pick<Event, "title" | "featured">;
  onToggle: () => void;
  busy?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={event.featured}
      aria-label={event.featured ? `Remove ${event.title} from featured` : `Feature ${event.title}`}
      disabled={busy}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-ink-100 disabled:opacity-50 focus-visible:outline-none focus-visible:shadow-focus",
        className,
      )}
    >
      <Star className={cn("size-4", event.featured ? "fill-amber-500 text-amber-500" : "text-fg-subtle")} aria-hidden />
    </button>
  );
}
