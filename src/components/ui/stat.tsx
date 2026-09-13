import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  /** Positive = good. Pass `invert` when a decrease is good (e.g. no-show rate). */
  delta?: { value: number; label?: string; invert?: boolean };
  className?: string;
}

/** KPI tile. Value is the hero; everything else is quiet. */
export function Stat({ label, value, hint, icon: Icon, delta, className }: StatProps) {
  const good = delta ? (delta.invert ? delta.value <= 0 : delta.value >= 0) : undefined;
  return (
    <div className={cn("flex flex-col gap-3 rounded-lg bg-surface p-5 shadow-card", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-fg-muted">{label}</span>
        {Icon ? <Icon className="size-4 text-fg-subtle" aria-hidden /> : null}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-[28px] font-semibold leading-none tracking-tight text-navy-900 tabular">{value}</span>
        {delta ? (
          <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium tabular", good ? "text-success-600" : "text-danger-600")}>
            {delta.value >= 0 ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
            {Math.abs(delta.value)}{delta.label ?? "%"}
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-fg-muted">{hint}</p> : null}
    </div>
  );
}
