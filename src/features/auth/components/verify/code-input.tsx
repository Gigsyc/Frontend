"use client";

import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const BOXES = [0, 1, 2, 3, 4, 5];
const digitsOnly = (value: string) => value.replace(/\D/g, "");

interface CodeInputProps {
  /** Up to six digits. The parent owns it so "Change email" can reset it. */
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Id of the message describing the group, e.g. a validation error. */
  describedBy?: string;
  className?: string;
}

/**
 * Six boxes that behave like one field: typing advances, backspace retreats, and a
 * pasted or autofilled code fills every box at once. The group carries the label; each
 * box names its own position so a screen reader knows where the caret is.
 */
export function CodeInput({ value, onChange, label, disabled, invalid, describedBy, className }: CodeInputProps) {
  const groupId = useId();
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focus = (index: number) => refs.current[Math.max(0, Math.min(5, index))]?.focus();

  /** One source of truth for every way digits arrive: typing, pasting, autofill. */
  const commit = (next: string, caret: number) => {
    onChange(next.slice(0, 6));
    focus(caret);
  };

  /**
   * The code is one left-packed string, so a digit typed into a box replaces that
   * position and never leaves a gap behind it.
   */
  const write = (index: number, raw: string) => {
    const digits = digitsOnly(raw);
    if (!digits) {
      // Only an emptied box deletes. A letter typed over a digit is simply ignored.
      if (raw === "" && value[index]) commit(value.slice(0, index) + value.slice(index + 1), index);
      return;
    }
    const head = value.slice(0, index);
    commit(head + digits + value.slice(head.length + digits.length), head.length + digits.length);
  };

  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      // Remove one digit and close the gap — never truncate everything after the caret.
      if (value[index]) commit(value.slice(0, index) + value.slice(index + 1), index);
      else if (index > 0) commit(value.slice(0, index - 1) + value.slice(index), index - 1);
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) { event.preventDefault(); focus(index - 1); }
    if (event.key === "ArrowRight" && index < 5) { event.preventDefault(); focus(index + 1); }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const digits = digitsOnly(event.clipboardData.getData("text"));
    if (!digits) return;
    event.preventDefault();
    commit(digits.slice(0, 6), digits.length);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span id={groupId} className="text-sm font-medium text-fg">{label}</span>
      <div role="group" aria-labelledby={groupId} aria-describedby={describedBy} className="flex gap-2 sm:gap-3">
        {BOXES.map((index) => (
          <input
            key={index}
            ref={(node) => { refs.current[index] = node; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            aria-label={`${label}, digit ${index + 1} of 6`}
            aria-invalid={invalid || undefined}
            value={value[index] ?? ""}
            onChange={(e) => write(index, e.target.value)}
            onKeyDown={onKeyDown(index)}
            onPaste={onPaste}
            onFocus={(e) => e.currentTarget.select()}
            className={cn(
              "h-11 w-full min-w-0 flex-1 rounded-md border bg-surface text-center font-display text-lg font-semibold tabular text-navy-900 sm:h-12 sm:text-xl",
              "transition-[border-color,box-shadow] duration-150 focus:border-cyan-500 focus:outline-none focus:shadow-focus",
              "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-fg-muted",
              invalid ? "border-danger-500" : "border-border-strong hover:border-ink-400",
            )}
          />
        ))}
      </div>
    </div>
  );
}
