"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { SelectTile } from "@/components/layout/onboarding-shell";
import { cn } from "@/lib/utils";

export interface TileOption<T extends string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Layout for this tile inside the group's grid, e.g. "sm:col-span-2". */
  className?: string;
}

interface TileRadioGroupProps<T extends string> {
  /** Names the group for screen readers — usually the question above it. */
  label: string;
  options: TileOption<T>[];
  value: T | null;
  onSelect: (value: T) => void;
  /** Continue is disabled until a tile is chosen, so the group says it is required. */
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const NEXT_KEYS = ["ArrowDown", "ArrowRight"];
const PREV_KEYS = ["ArrowUp", "ArrowLeft"];

/**
 * The real radio-group contract over `SelectTile`: one tab stop for the whole group, arrows move
 * the choice and wrap, Home/End jump to the ends. Claiming `role="radiogroup"` over nine plain
 * buttons tells a screen-reader user "radio 1 of 9" and then leaves that navigation dead.
 */
export function TileRadioGroup<T extends string>({
  label, options, value, onSelect, required, disabled, className,
}: TileRadioGroupProps<T>) {
  const group = useRef<HTMLDivElement>(null);
  // Nothing chosen yet: the first tile holds the tab stop so the group is reachable.
  const active = Math.max(0, options.findIndex((option) => option.value === value));

  const move = (index: number) => {
    const wrapped = (index + options.length) % options.length;
    const option = options[wrapped];
    if (!option) return;
    onSelect(option.value);
    group.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[wrapped]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (disabled) return;
    if (NEXT_KEYS.includes(event.key)) move(index + 1);
    else if (PREV_KEYS.includes(event.key)) move(index - 1);
    else if (event.key === "Home") move(0);
    else if (event.key === "End") move(options.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label={label}
      aria-required={required || undefined}
      className={cn("grid gap-3", className)}
    >
      {options.map((option, index) => (
        <SelectTile
          key={option.value}
          role="radio"
          selected={option.value === value}
          disabled={disabled}
          tabIndex={index === active ? 0 : -1}
          onClick={() => onSelect(option.value)}
          onKeyDown={(event) => onKeyDown(event, index)}
          icon={option.icon}
          label={option.label}
          description={option.description}
          className={cn("disabled:pointer-events-none disabled:opacity-60", option.className)}
        />
      ))}
    </div>
  );
}
