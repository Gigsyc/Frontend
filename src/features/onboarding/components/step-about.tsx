"use client";

import { Chip } from "@/components/ui/chip";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { DISTRICTS, LANGUAGES } from "@/data/roles";
import type { KigaliDistrict } from "@/types";
import type { AboutState, Action } from "../lib/state";
import type { StepErrors } from "../lib/steps";

export function StepAbout({ about, errors, dispatch }: { about: AboutState; errors: StepErrors; dispatch: (a: Action) => void }) {
  const patch = (p: Partial<AboutState>) => dispatch({ type: "patchAbout", patch: p });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" required error={errors.firstName}>
          {(p) => <Input {...p} value={about.firstName} autoComplete="given-name" onChange={(e) => patch({ firstName: e.target.value })} placeholder="e.g. Esther" />}
        </Field>
        <Field label="Last name" required error={errors.lastName}>
          {(p) => <Input {...p} value={about.lastName} autoComplete="family-name" onChange={(e) => patch({ lastName: e.target.value })} placeholder="e.g. Uwera" />}
        </Field>
      </div>
      <Field label="Mobile number" required error={errors.phone} hint="We'll text a 6-digit code. This is also where your pay goes, so use the number registered for MoMo or Airtel Money.">
        {(p) => (
          <Input
            {...p}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={about.phone}
            onChange={(e) => patch({ phone: e.target.value })}
            leading={<span className="text-[13px] font-medium">+250</span>}
            className="pl-14"
            placeholder="788 123 456"
          />
        )}
      </Field>
      <Field label="Home district" required error={errors.district} hint="Used to find shifts close to you. Not shown to employers until you're booked.">
        {(p) => (
          <Select {...p} value={about.district} onChange={(e) => patch({ district: e.target.value as KigaliDistrict })}>
            <option value="" disabled>Choose a district</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        )}
      </Field>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium text-fg">Languages you can work in <span className="text-danger-500">*</span></legend>
        <div className="flex flex-wrap gap-2 pt-1">
          {LANGUAGES.map((l) => (
            <Chip key={l} selected={about.languages.includes(l)} onClick={() => dispatch({ type: "toggleLanguage", language: l })} className="h-11 sm:h-8">{l}</Chip>
          ))}
        </div>
        {errors.languages ? <p role="alert" className="text-[13px] text-danger-600">{errors.languages}</p> : <p className="text-[13px] text-fg-muted">Conference and hotel shifts often ask for English or French alongside Kinyarwanda.</p>}
      </fieldset>
    </div>
  );
}
