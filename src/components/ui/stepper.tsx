import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: Array<{ id: string; label: string; description?: string }>;
  current: number; // index
  className?: string;
  onStepClick?: (index: number) => void;
}

/** Horizontal on desktop, compact progress on mobile. */
export function Stepper({ steps, current, className, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="hidden items-center gap-2 md:flex">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = onStepClick && i < current;
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2 last:flex-none">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onStepClick?.(i)}
                aria-current={active ? "step" : undefined}
                className={cn("flex items-center gap-2.5 rounded-md text-left disabled:cursor-default", clickable && "hover:opacity-80")}
              >
                <span className={cn(
                  "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done ? "bg-navy-900 text-white" : active ? "bg-amber-500 text-navy-900 ring-4 ring-amber-100" : "bg-ink-100 text-fg-muted",
                )}>
                  {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                <span className="flex flex-col">
                  <span className={cn("text-sm font-medium", active ? "text-navy-900" : done ? "text-fg" : "text-fg-muted")}>{s.label}</span>
                </span>
              </button>
              {i < steps.length - 1 ? <span className={cn("mx-2 h-px flex-1", done ? "bg-navy-900" : "bg-border")} aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
      <div className="md:hidden">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-navy-900">{steps[current]?.label}</span>
          <span className="tabular text-fg-muted">Step {current + 1} of {steps.length}</span>
        </div>
        <div className="mt-2 flex gap-1">
          {steps.map((s, i) => <span key={s.id} className={cn("h-1 flex-1 rounded-full", i <= current ? "bg-navy-900" : "bg-ink-200")} />)}
        </div>
      </div>
    </nav>
  );
}
