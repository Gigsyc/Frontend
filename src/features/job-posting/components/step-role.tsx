"use client";

import { RoleIcon } from "@/components/common";
import { Field, Input, Select } from "@/components/ui";
import { ROLES, ROLE_LIST } from "@/data/roles";
import { cn } from "@/lib/utils";
import type { RoleCategory } from "@/types";
import type { PostTo, WizardState } from "../state";
import type { StepErrors } from "../validation";
import { CountStepper } from "./count-stepper";

interface StepRoleProps {
  state: WizardState;
  errors: StepErrors;
  set: (patch: Partial<WizardState>) => void;
}

export function StepRole({ state, errors, set }: StepRoleProps) {
  const pickRole = (role: RoleCategory) => {
    const patch: Partial<WizardState> = { role };
    // Suggest "<Role label> · " until the employer types their own title.
    if (!state.titleTouched) patch.title = `${ROLES[role].label} · `;
    set(patch);
  };

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-sm font-medium text-fg">
          Role <span className="text-danger-500">*</span>
        </legend>
        <p className="mt-0.5 text-[13px] text-fg-muted">What will the workers actually do? This sets who gets notified.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ROLE_LIST.map((r) => {
            const active = state.role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={active}
                onClick={() => pickRole(r.id)}
                className={cn(
                  "flex min-h-11 flex-col items-start gap-2 rounded-lg border p-3 text-left transition-[border-color,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:shadow-focus",
                  active ? "border-navy-900 bg-navy-50 shadow-card" : "border-border bg-surface hover:border-ink-400 hover:bg-ink-50",
                )}
              >
                <RoleIcon role={r.id} size="sm" className={cn(active && "bg-navy-900 text-white")} />
                <span className="text-sm font-semibold leading-5 text-fg">{r.label}</span>
                <span className="line-clamp-2 text-xs leading-4 text-fg-muted">{r.description}</span>
              </button>
            );
          })}
        </div>
        {errors.role ? <p role="alert" className="mt-2 text-[13px] text-danger-600">{errors.role}</p> : null}
      </fieldset>

      <Field label="Shift title" required error={errors.title} hint="Role first, then the event or venue — the way workers scan a list.">
        {(p) => (
          <Input
            {...p}
            value={state.title}
            placeholder="e.g. Banquet servers · Rwanda Bankers' Gala Dinner"
            onChange={(e) => set({ title: e.target.value, titleTouched: true })}
            maxLength={90}
          />
        )}
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Workers needed" required error={errors.workersNeeded}>
          {(p) => <CountStepper {...p} value={state.workersNeeded} onChange={(n) => set({ workersNeeded: n })} />}
        </Field>
        <Field label="Post to" hint={state.postTo === "pool" ? "Your talent pool sees it first; everyone else after a few hours." : "All verified workers with this skill are notified."}>
          {(p) => (
            <Select {...p} value={state.postTo} onChange={(e) => set({ postTo: e.target.value as PostTo })}>
              <option value="everyone">Everyone</option>
              <option value="pool">Talent pool first</option>
            </Select>
          )}
        </Field>
      </div>
    </div>
  );
}
