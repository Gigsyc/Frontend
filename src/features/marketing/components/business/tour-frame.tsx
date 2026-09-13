import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Screenshot-like chrome for the product tour: a quiet title bar over real primitives. */
export function TourFrame({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg bg-surface shadow-raised ring-1 ring-border", className)}>
      <div className="flex items-center gap-2 border-b border-border bg-canvas px-4 py-2.5">
        <span className="flex gap-1" aria-hidden>
          <span className="size-2 rounded-full bg-ink-200" />
          <span className="size-2 rounded-full bg-ink-200" />
          <span className="size-2 rounded-full bg-ink-200" />
        </span>
        <span className="ml-2 truncate text-xs font-medium text-fg-muted">{title}</span>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

export function TourRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border border-border p-3">
          <Skeleton className="size-9 rounded-md" />
          <div className="flex-1"><Skeleton className="h-3.5 w-3/4" /><Skeleton className="mt-2 h-3 w-1/2" /></div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

export const listMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: (i: number) => ({ duration: 0.3, delay: Math.min(i, 8) * 0.03, ease: [0.22, 1, 0.36, 1] as const }),
};
