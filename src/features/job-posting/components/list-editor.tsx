"use client";

import { Plus, X } from "lucide-react";
import { Button, Input } from "@/components/ui";

interface ListEditorProps {
  label: string;
  singular: string;
  items: string[];
  onChange: (items: string[]) => void;
  min?: number;
  placeholder?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

/** Add/remove a list of one-line items (responsibilities, requirements). */
export function ListEditor({ label, singular, items, onChange, min = 0, placeholder, error, hint, optional }: ListEditorProps) {
  const update = (i: number, v: string) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);
  const canRemove = items.length > min;

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 flex w-full items-baseline justify-between text-sm font-medium text-fg">
        <span>{label}{min > 0 ? <span className="text-danger-500"> *</span> : null}</span>
        {optional ? <span className="text-xs font-normal text-fg-subtle">Optional</span> : null}
      </legend>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <Input
              aria-label={`${singular} ${i + 1}`}
              value={item}
              placeholder={i === 0 ? placeholder : undefined}
              onChange={(e) => update(i, e.target.value)}
              aria-invalid={error ? true : undefined}
            />
            <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${singular.toLowerCase()} ${i + 1}`} disabled={!canRemove} onClick={() => remove(i)} className="shrink-0 text-fg-muted">
              <X />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={add} disabled={items.length >= 10} className="-ml-2 text-navy-700">
          <Plus /> Add {items.length ? "another" : singular.toLowerCase()}
        </Button>
        {error ? <p role="alert" className="text-[13px] text-danger-600">{error}</p> : hint ? <p className="text-[13px] text-fg-muted">{hint}</p> : null}
      </div>
    </fieldset>
  );
}
