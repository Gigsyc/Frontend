"use client";

import { AlertTriangle } from "lucide-react";
import { Field, Input, SwitchField, Textarea } from "@/components/ui";
import { ROLES } from "@/data/roles";
import { formatRwf } from "@/lib/utils";
import type { WizardState } from "../state";
import type { StepErrors } from "../validation";
import { ListEditor } from "./list-editor";

interface StepPayDetailsProps {
  state: WizardState;
  errors: StepErrors;
  set: (patch: Partial<WizardState>) => void;
}

const digitsOnly = (v: string) => v.replace(/[^\d]/g, "");

export function StepPayDetails({ state, errors, set }: StepPayDetailsProps) {
  const meta = state.role ? ROLES[state.role] : null;
  const pay = Number(state.pay);
  const [lo, hi] = meta?.typicalPay ?? [0, 0];
  const belowRange = !!meta && state.pay.trim() !== "" && pay > 0 && pay < lo;
  const typical = meta ? `Typical ${formatRwf(lo)}–${hi.toLocaleString("en-US")} for ${meta.short.toLowerCase()} shifts.` : undefined;

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Pay</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Field label="Pay per shift" required error={errors.pay} hint={belowRange ? undefined : typical}>
              {(p) => (
                <Input
                  {...p}
                  inputMode="numeric"
                  value={state.pay}
                  placeholder={meta ? String(lo) : "25000"}
                  leading={<span className="text-xs font-semibold text-fg-muted">RWF</span>}
                  className="pl-12 font-display font-semibold tabular"
                  onChange={(e) => set({ pay: digitsOnly(e.target.value) })}
                />
              )}
            </Field>
            {belowRange && !errors.pay ? (
              <p className="inline-flex items-start gap-1.5 text-[13px] text-warning-700">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                Below the typical range for {meta?.short.toLowerCase()} shifts ({formatRwf(lo)}–{hi.toLocaleString("en-US")}). Expect fewer applications.
              </p>
            ) : null}
          </div>
          <Field label="Transport allowance" optional error={errors.transport} hint="Paid on top of the shift pay.">
            {(p) => (
              <Input
                {...p}
                inputMode="numeric"
                value={state.transport}
                placeholder="0"
                leading={<span className="text-xs font-semibold text-fg-muted">RWF</span>}
                className="pl-12 tabular"
                onChange={(e) => set({ transport: digitsOnly(e.target.value) })}
              />
            )}
          </Field>
        </div>
        <div className="rounded-lg border border-border p-4">
          <SwitchField label="Meal provided" description="Workers see this on the shift card. It matters for long shifts." checked={state.mealProvided} onCheckedChange={(v) => set({ mealProvided: v })} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Details</h2>
        <Field label="Description" required error={errors.description} hint="What's the event, how many guests, what does a good shift look like?">
          {(p) => <Textarea {...p} value={state.description} rows={4} placeholder="Formal plated dinner for 320 guests. Three-course silver service with a welcome cocktail hour…" onChange={(e) => set({ description: e.target.value })} />}
        </Field>
        <ListEditor
          label="Responsibilities"
          singular="Responsibility"
          items={state.responsibilities}
          min={1}
          placeholder="e.g. Plated service for assigned tables"
          error={errors.responsibilities}
          onChange={(responsibilities) => set({ responsibilities })}
        />
        <ListEditor
          label="Requirements"
          singular="Requirement"
          items={state.requirements}
          optional
          placeholder="e.g. Previous banquet experience"
          hint="Only list what you'd turn someone away for."
          onChange={(requirements) => set({ requirements })}
        />
        <Field label="Dress code" optional>
          {(p) => <Input {...p} value={state.dressCode} placeholder="e.g. Black trousers, black closed shoes. Apron provided." onChange={(e) => set({ dressCode: e.target.value })} />}
        </Field>
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
          <SwitchField label="Mark as urgent" description="Notify matching workers immediately and flag the shift on their Discover feed." checked={state.urgent} onCheckedChange={(v) => set({ urgent: v })} />
        </div>
      </section>
    </div>
  );
}
