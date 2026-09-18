"use client";

import { Plus, X } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { newTier, type TierDraft } from "./state";
import { TIERS_MAX } from "./validation";

interface TierEditorProps {
  tiers: TierDraft[];
  onChange: (tiers: TierDraft[]) => void;
  error?: string;
}

const digitsOnly = (v: string) => v.replace(/[^\d]/g, "");

/** 1–4 ticket types: name, price in RWF (0 = free) and an optional line of detail. */
export function TierEditor({ tiers, onChange, error }: TierEditorProps) {
  const update = (id: string, patch: Partial<TierDraft>) => onChange(tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id: string) => onChange(tiers.filter((t) => t.id !== id));

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 flex w-full items-baseline justify-between text-sm font-medium text-fg">
        <span>Ticket types <span className="text-danger-500">*</span></span>
        <span className="text-xs font-normal text-fg-subtle">{tiers.length}/{TIERS_MAX}</span>
      </legend>
      <ul className="flex flex-col gap-3">
        {tiers.map((t, i) => {
          const price = Number(t.price);
          const free = t.price.trim() !== "" && price === 0;
          return (
            <li key={t.id} className="rounded-lg border border-border bg-surface p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_11rem_2.75rem]">
                <Input
                  aria-label={`Ticket type ${i + 1} name`}
                  value={t.name}
                  maxLength={40}
                  placeholder={i === 0 ? "e.g. General" : "e.g. Early bird"}
                  onChange={(e) => update(t.id, { name: e.target.value })}
                  aria-invalid={error && !t.name.trim() ? true : undefined}
                  className="h-11"
                />
                <Input
                  aria-label={`Ticket type ${i + 1} price in francs`}
                  inputMode="numeric"
                  value={t.price}
                  placeholder="0"
                  leading={<span className="text-xs font-semibold text-fg-muted">RWF</span>}
                  trailing={free ? <span className="text-xs font-semibold text-success-700">Free</span> : undefined}
                  onChange={(e) => update(t.id, { price: digitsOnly(e.target.value) })}
                  aria-invalid={error && !t.price.trim() ? true : undefined}
                  className="h-11 pl-12 font-display font-semibold tabular"
                />
                <Button type="button" variant="ghost" size="icon" aria-label={`Remove ticket type ${i + 1}`} disabled={tiers.length <= 1} onClick={() => remove(t.id)} className="size-11 justify-self-end text-fg-muted sm:justify-self-auto">
                  <X />
                </Button>
              </div>
              <Input
                aria-label={`Ticket type ${i + 1} description`}
                value={t.description}
                maxLength={80}
                placeholder="Optional — e.g. Reserved table, bottle service"
                onChange={(e) => update(t.id, { description: e.target.value })}
                className="mt-3 h-11"
              />
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...tiers, newTier()])} disabled={tiers.length >= TIERS_MAX} className="-ml-2 h-11 text-navy-700">
          <Plus /> Add another ticket type
        </Button>
        {error ? <p role="alert" className="text-[13px] text-danger-600">{error}</p> : <p className="text-[13px] text-fg-muted">Set the price to 0 for a free ticket.</p>}
      </div>
    </fieldset>
  );
}
