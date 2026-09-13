"use client";

import { SwitchField } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { ROLES } from "@/data/roles";
import { formatRwf } from "@/lib/utils";
import type { RoleCategory, Worker } from "@/types";
import type { Action, AvailabilityState, TravelRadius } from "../lib/state";
import { RADIUS_OPTIONS, type StepErrors } from "../lib/steps";

const WINDOWS: Array<{ key: keyof Worker["availability"]; label: string; description: string }> = [
  { key: "weekdays", label: "Weekdays", description: "Monday to Friday, daytime" },
  { key: "weekends", label: "Weekends", description: "Saturday and Sunday" },
  { key: "evenings", label: "Evenings", description: "Shifts that finish after 20:00" },
  { key: "overnight", label: "Overnight", description: "Shifts that run past midnight" },
];

export function StepAvailability({ availability, primary, district, errors, dispatch }: { availability: AvailabilityState; primary: RoleCategory | null; district: string; errors: StepErrors; dispatch: (a: Action) => void }) {
  const range = primary ? ROLES[primary].typicalPay : null;
  const homeLabel = district ? `${district} only` : RADIUS_OPTIONS[0].label;

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium text-fg">When can you work? <span className="text-danger-500">*</span></legend>
        <ul className="divide-y divide-border rounded-md border border-border px-4">
          {WINDOWS.map((w) => (
            <li key={w.key} className="py-3">
              <SwitchField label={w.label} description={w.description} checked={availability.windows[w.key]} onCheckedChange={(on) => dispatch({ type: "toggleWindow", key: w.key, on })} className="min-h-11" />
            </li>
          ))}
        </ul>
        {errors.windows ? <p role="alert" className="text-[13px] text-danger-600">{errors.windows}</p> : null}
      </fieldset>

      <Field
        label="Minimum pay per shift"
        required
        error={errors.minPay}
        hint={range && primary ? `Typical for ${ROLES[primary].short.toLowerCase()} shifts in Kigali: ${formatRwf(range[0])} – ${formatRwf(range[1])}. We won't show you shifts below your minimum.` : "Most shifts pay RWF 15,000 – 30,000. We won't show you shifts below your minimum."}
      >
        {(p) => (
          <Input
            {...p}
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            value={availability.minPay}
            onChange={(e) => dispatch({ type: "patchAvailability", patch: { minPay: e.target.value } })}
            leading={<span className="text-[13px] font-medium">RWF</span>}
            className="pl-13"
            placeholder={range ? String(range[0]) : "15000"}
          />
        )}
      </Field>

      <Field label="How far will you travel?" required error={errors.radius} hint={availability.radius ? RADIUS_OPTIONS.find((o) => o.value === availability.radius)!.hint : "Transport allowances are shown on each shift."}>
        {(p) => (
          <Select {...p} value={availability.radius} onChange={(e) => dispatch({ type: "patchAvailability", patch: { radius: e.target.value as TravelRadius } })}>
            <option value="" disabled>Choose a radius</option>
            {RADIUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.value === "home" ? homeLabel : o.label}</option>)}
          </Select>
        )}
      </Field>
    </div>
  );
}
