import { cn } from "@/lib/utils";
import type { Step } from "../content";

/**
 * Numbered, connected timeline. Vertical rail on small screens, a horizontal
 * hairline between the numbers from md up. Deliberately not an icon grid.
 */
export function StepTimeline({ steps, className }: { steps: Step[]; className?: string }) {
  return (
    <ol className={cn("grid gap-8 md:grid-cols-4 md:gap-6", className)}>
      {steps.map((step, i) => {
        const Icon = step.icon;
        const last = i === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-4 md:flex-col md:gap-5">
            {!last ? (
              <span
                aria-hidden
                className="absolute left-5 top-10 -bottom-8 w-px bg-border md:bottom-auto md:left-10 md:top-5 md:-right-6 md:h-px md:w-auto"
              />
            ) : null}
            <span className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-900 font-display text-sm font-semibold text-white ring-4 ring-surface tabular">
              {i + 1}
            </span>
            <div className="min-w-0 pt-1.5 md:pt-0">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <Icon className="size-4 text-navy-600" aria-hidden />
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-fg-muted">{step.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
