import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Label/value pairs — job details, invoice summaries, profile facts. */
export function DataList({ items, className, columns = 1 }: { items: Array<{ label: string; value: ReactNode }>; className?: string; columns?: 1 | 2 }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-3", columns === 2 && "sm:grid-cols-2", className)}>
      {items.map((it) => (
        <div key={it.label} className="flex flex-col gap-0.5">
          <dt className="text-xs font-medium text-fg-muted">{it.label}</dt>
          <dd className="text-sm text-fg">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
