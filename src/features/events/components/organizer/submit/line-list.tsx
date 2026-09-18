"use client";

import { Plus, X } from "lucide-react";
import { Button, Input } from "@/components/ui";

interface LineListProps {
  label: string;
  /** Used for the add button and aria labels, e.g. "highlight". */
  singular: string;
  items: string[];
  onChange: (items: string[]) => void;
  min?: number;
  max: number;
  placeholder?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  /** Longest sensible line; the counter turns amber past it. */
  maxLength?: number;
}

/** Add/remove a list of one-line items — highlights, good-to-know notes. */
export function LineList({ label, singular, items, onChange, min = 0, max, placeholder, error, hint, optional, maxLength = 80 }: LineListProps) {
  const update = (i: number, v: string) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);
  const canRemove = items.length > min;

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 flex w-full items-baseline justify-between text-sm font-medium text-fg">
        <span>{label}{min > 0 ? <span className="text-danger-500"> *</span> : null}</span>
        <span className="text-xs font-normal text-fg-subtle">{optional ? "Optional · " : ""}{items.length}/{max}</span>
      </legend>
      {items.length ? (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <Input
                aria-label={`${singular} ${i + 1}`}
                value={item}
                maxLength={maxLength}
                placeholder={i === 0 ? placeholder : undefined}
                onChange={(e) => update(i, e.target.value)}
                aria-invalid={error ? true : undefined}
                className="h-11"
              />
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${singular} ${i + 1}`} disabled={!canRemove} onClick={() => remove(i)} className="size-11 shrink-0 text-fg-muted">
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={add} disabled={items.length >= max} className="-ml-2 h-11 text-navy-700">
          <Plus /> Add {items.length ? "another" : `a ${singular}`}
        </Button>
        {error ? <p role="alert" className="text-[13px] text-danger-600">{error}</p> : hint ? <p className="text-[13px] text-fg-muted">{hint}</p> : null}
      </div>
    </fieldset>
  );
}
