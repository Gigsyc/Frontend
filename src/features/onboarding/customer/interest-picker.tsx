"use client";

import { Check } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { INTEREST_LIST } from "@/data/auth";
import { cn } from "@/lib/utils";
import type { InterestId } from "@/types";

interface InterestPickerProps {
  value: InterestId[];
  onChange: (next: InterestId[]) => void;
  /** Names the group for screen readers — the heading above it differs per surface. */
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * The twelve interests as image-backed cards. Presentational on purpose: onboarding and the
 * account page both render it, and each owns its own saving.
 */
export function InterestPicker({ value, onChange, label = "Interests", className, disabled }: InterestPickerProps) {
  const toggle = (id: InterestId) =>
    onChange(value.includes(id) ? value.filter((i) => i !== id) : [...value, id]);

  return (
    <div role="group" aria-label={label} className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {INTEREST_LIST.map((interest) => {
        const on = value.includes(interest.id);
        return (
          <button
            key={interest.id}
            type="button"
            role="checkbox"
            aria-checked={on}
            disabled={disabled}
            onClick={() => toggle(interest.id)}
            className={cn(
              "group relative min-h-11 overflow-hidden rounded-lg text-left transition-[box-shadow,transform] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-60",
              on ? "ring-2 ring-navy-900 ring-offset-2 ring-offset-canvas" : "shadow-card",
            )}
          >
            <Photo
              src={interest.image}
              alt=""
              aspect="square"
              rounded={false}
              tint={false}
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
              className="transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-transparent" aria-hidden />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
              <span className="text-sm font-semibold leading-5 text-white">{interest.label}</span>
              <span
                aria-hidden
                className={cn(
                  "inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  on ? "border-white bg-white text-navy-900" : "border-white/60 bg-navy-950/20 text-transparent",
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
