"use client";

import { Checkbox as RxCheckbox, Switch as RxSwitch } from "radix-ui";
import { Check, Minus } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: ComponentProps<typeof RxCheckbox.Root>) {
  return (
    <RxCheckbox.Root
      className={cn(
        "peer flex size-[18px] shrink-0 items-center justify-center rounded-xs border border-border-strong bg-surface transition-colors data-[state=checked]:border-navy-900 data-[state=checked]:bg-navy-900 data-[state=indeterminate]:border-navy-900 data-[state=indeterminate]:bg-navy-900 hover:border-ink-400 disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RxCheckbox.Indicator className="text-white">
        {props.checked === "indeterminate" ? <Minus className="size-3" strokeWidth={3} /> : <Check className="size-3" strokeWidth={3} />}
      </RxCheckbox.Indicator>
    </RxCheckbox.Root>
  );
}

export function CheckboxField({ label, description, className, ...props }: ComponentProps<typeof RxCheckbox.Root> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm", className)}>
      <Checkbox className="mt-0.5" {...props} />
      <span className="flex flex-col gap-0.5">
        <span className="font-medium text-fg">{label}</span>
        {description ? <span className="text-fg-muted">{description}</span> : null}
      </span>
    </label>
  );
}

export function Switch({ className, ...props }: ComponentProps<typeof RxSwitch.Root>) {
  return (
    <RxSwitch.Root
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full bg-ink-300 transition-colors data-[state=checked]:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RxSwitch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out-soft data-[state=checked]:translate-x-[18px]" />
    </RxSwitch.Root>
  );
}

export function SwitchField({ label, description, className, ...props }: ComponentProps<typeof RxSwitch.Root> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between gap-4 text-sm", className)}>
      <span className="flex flex-col gap-0.5">
        <span className="font-medium text-fg">{label}</span>
        {description ? <span className="text-fg-muted">{description}</span> : null}
      </span>
      <Switch {...props} />
    </label>
  );
}
