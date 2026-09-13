"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Slim bar plus "2 of 3". Deliberately quieter than the employer wizard's Stepper. */
export function OnboardingProgress({ step, total, className }: { step: number; total: number; className?: string }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-200" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={total} aria-label={`Step ${step + 1} of ${total}`}>
        <motion.div className="h-full rounded-full bg-navy-900" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.35, ease: EASE }} />
      </div>
      <span className="shrink-0 text-xs font-medium tabular text-fg-muted">{step + 1} of {total}</span>
    </div>
  );
}

interface OnboardingShellProps {
  step: number;
  total: number;
  onBack?: () => void;
  /** Hidden on the first step. */
  backLabel?: string;
  children: ReactNode;
  /** Sticky footer action area. */
  primary: ReactNode;
  secondary?: ReactNode;
  /** Shown above the heading, e.g. "Skip for now". */
  skip?: ReactNode;
}

/**
 * One centred column, a slim progress bar, and a footer that stays reachable on a phone.
 * Onboarding should feel like three quick questions, not a form.
 */
export function OnboardingShell({ step, total, onBack, backLabel = "Back", children, primary, secondary, skip }: OnboardingShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-5 sm:px-8">
        <Logo size="sm" />
        {skip}
      </header>

      <main id="main" className="flex flex-1 justify-center px-5 pb-32 sm:px-8">
        <div className="w-full max-w-xl">
          <OnboardingProgress step={step} total={total} className="mb-8" />
          {onBack && step > 0 ? (
            <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-fg-muted transition-colors hover:text-fg">
              <ArrowLeft className="size-4" aria-hidden /> {backLabel}
            </button>
          ) : null}
          <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
            {children}
          </motion.div>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
          <div className="min-w-0">{secondary}</div>
          <div className="shrink-0">{primary}</div>
        </div>
      </footer>
    </div>
  );
}

/** Heading pair used at the top of each onboarding step. */
export function OnboardingHeading({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <div className="mb-7">
      <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-navy-900 sm:text-[30px]">{title}</h1>
      {description ? <p className="mt-2 text-[15px] leading-6 text-fg-muted">{description}</p> : null}
    </div>
  );
}

/**
 * Selectable tile used for interests, places and preferences. Multi-select rows use
 * `selected`; single-select rows behave as radios via `role`.
 */
export function SelectTile({ selected, icon, label, description, className, role = "checkbox", ...props }: {
  selected: boolean;
  icon?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  role?: "checkbox" | "radio";
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "role">) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      className={cn(
        "flex min-h-[56px] w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-[border-color,background-color,transform] duration-150 active:scale-[0.99]",
        selected ? "border-navy-900 bg-navy-50" : "border-border bg-surface hover:border-ink-400",
        className,
      )}
      {...props}
    >
      {icon ? <span className={cn("shrink-0 [&_svg]:size-5", selected ? "text-navy-800" : "text-ink-500")}>{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm font-medium", selected ? "text-navy-900" : "text-fg")}>{label}</span>
        {description ? <span className="mt-0.5 block text-[13px] leading-5 text-fg-muted">{description}</span> : null}
      </span>
    </button>
  );
}
