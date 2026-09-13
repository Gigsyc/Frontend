"use client";

import { Tabs as Rx } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Tabs = Rx.Root;
export const TabsContent = Rx.Content;

/** Underline tabs — the default for page sections. */
export function TabsList({ className, ...props }: ComponentProps<typeof Rx.List>) {
  return (
    <Rx.List
      className={cn("scrollbar-none -mb-px flex gap-1 overflow-x-auto border-b border-border", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, count, children, ...props }: ComponentProps<typeof Rx.Trigger> & { count?: number }) {
  return (
    <Rx.Trigger
      className={cn(
        "relative inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-medium text-fg-muted transition-colors hover:text-fg data-[state=active]:border-navy-900 data-[state=active]:text-navy-900 focus-visible:outline-none focus-visible:shadow-focus rounded-t-sm",
        className,
      )}
      {...props}
    >
      {children}
      {typeof count === "number" ? (
        <span className="rounded-sm bg-ink-100 px-1.5 py-0.5 text-xs font-medium tabular text-ink-600 group-data-[state=active]:bg-navy-50">{count}</span>
      ) : null}
    </Rx.Trigger>
  );
}

/** Pill-style segmented control for compact filters (e.g. Today / This week). */
export function Segmented<T extends string>({ value, onChange, options, className, size = "md", ariaLabel }: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; count?: number }>;
  className?: string;
  size?: "sm" | "md";
  ariaLabel: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("inline-flex rounded-md bg-ink-100 p-0.5", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[5px] font-medium transition-[background-color,color,box-shadow] duration-150",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm",
              active ? "bg-surface text-navy-900 shadow-card" : "text-fg-muted hover:text-fg",
            )}
          >
            {o.label}
            {typeof o.count === "number" ? <span className={cn("tabular text-xs", active ? "text-fg-muted" : "text-fg-subtle")}>{o.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
