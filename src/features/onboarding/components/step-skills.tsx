"use client";

import { Star } from "lucide-react";
import { RoleIcon } from "@/components/common/role-icon";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/tabs";
import { ROLE_LIST } from "@/data/roles";
import { cn } from "@/lib/utils";
import type { RoleCategory } from "@/types";
import { HEADLINE_MAX, MAX_ROLES, type Action, type Experience, type SkillsState } from "../lib/state";
import { EXPERIENCE_OPTIONS, type StepErrors } from "../lib/steps";

function RoleTile({ role, selected, primary, disabled, onToggle, onPrimary }: { role: RoleCategory; selected: boolean; primary: boolean; disabled: boolean; onToggle: () => void; onPrimary: () => void }) {
  const meta = ROLE_LIST.find((r) => r.id === role)!;
  return (
    <div className={cn("relative flex items-center gap-3 rounded-md border p-3 transition-[border-color,background-color,box-shadow] has-[>button:focus-visible]:shadow-focus", selected ? "border-navy-900 bg-navy-50/60" : disabled ? "border-border opacity-50" : "border-border-strong hover:border-ink-400")}>
      <button type="button" aria-pressed={selected} disabled={disabled && !selected} onClick={onToggle} className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none">
        <RoleIcon role={role} size="sm" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-fg">{meta.label}</span>
          <span className="block truncate text-xs text-fg-muted">{primary ? "Primary role" : meta.description}</span>
        </span>
      </button>
      {selected ? (
        <button
          type="button"
          onClick={onPrimary}
          aria-pressed={primary}
          aria-label={primary ? `${meta.short} is your primary role` : `Make ${meta.short} your primary role`}
          className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-colors", primary ? "text-amber-600" : "text-ink-300 hover:bg-ink-100 hover:text-fg")}
        >
          <Star className={cn("size-5", primary && "fill-amber-500 text-amber-500")} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export function StepSkills({ skills, errors, dispatch }: { skills: SkillsState; errors: StepErrors; dispatch: (a: Action) => void }) {
  const full = skills.roles.length >= MAX_ROLES;
  const headlineLeft = HEADLINE_MAX - skills.headline.length;

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="flex w-full items-baseline justify-between text-sm font-medium text-fg">
          <span>Roles <span className="text-danger-500">*</span></span>
          <span className="text-xs font-normal tabular text-fg-muted">{skills.roles.length}/{MAX_ROLES} picked</span>
        </legend>
        <p className="text-[13px] text-fg-muted">Tap a role to add it. Tap the star to make it your primary — the one we match you on most.</p>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {ROLE_LIST.map((r) => (
            <RoleTile
              key={r.id}
              role={r.id}
              selected={skills.roles.includes(r.id)}
              primary={skills.primary === r.id}
              disabled={full && !skills.roles.includes(r.id)}
              onToggle={() => dispatch({ type: "toggleRole", role: r.id })}
              onPrimary={() => dispatch({ type: "setPrimary", role: r.id })}
            />
          ))}
        </div>
        {errors.roles ? <p role="alert" className="text-[13px] text-danger-600">{errors.roles}</p> : null}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <p id="experience-label" className="text-sm font-medium text-fg">Years of experience <span className="text-danger-500">*</span></p>
        <Segmented<Experience | "">
          ariaLabel="Years of experience"
          value={skills.experience ?? ""}
          onChange={(v) => { if (v) dispatch({ type: "patchSkills", patch: { experience: v } }); }}
          options={EXPERIENCE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          className="w-full [&>button]:flex-1 [&>button]:min-h-10"
        />
        {errors.experience ? <p role="alert" className="text-[13px] text-danger-600">{errors.experience}</p> : (
          <p className="text-[13px] text-fg-muted">{skills.experience ? EXPERIENCE_OPTIONS.find((o) => o.value === skills.experience)!.hint : "New is fine — every worker on GigSyc started with zero shifts."}</p>
        )}
      </div>

      <Field label="Headline" required error={errors.headline} hint={`${headlineLeft} characters left · the first line employers read, e.g. "Hospitality graduate · banquet & café service"`}>
        {(p) => <Input {...p} value={skills.headline} maxLength={HEADLINE_MAX} onChange={(e) => dispatch({ type: "patchSkills", patch: { headline: e.target.value } })} placeholder="e.g. Hospitality graduate · banquet & café service" />}
      </Field>
    </div>
  );
}
