"use client";

import { Field, Input, Select, SwitchField } from "@/components/ui";
import { PLACES } from "@/data/events";
import type { RwandaPlace } from "@/types";
import { AGE_OPTIONS, type AgeOption, type SubmitState } from "./state";
import { runsLabel, todayIso, type StepErrors } from "./validation";

interface StepWhenWhereProps {
  state: SubmitState;
  errors: StepErrors;
  set: (patch: Partial<SubmitState>) => void;
}

const AGE_LABEL: Record<AgeOption, string> = { "": "None — all ages welcome", "16+": "16 and over", "18+": "18 and over", "21+": "21 and over" };

export function StepWhenWhere({ state, errors, set }: StepWhenWhereProps) {
  const runs = runsLabel(state);
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold">When</h2>
          {runs ? <span className="rounded-sm bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-800 tabular">{runs}</span> : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={state.multiDay ? "First day" : "Date"} required error={errors.date}>
            {(p) => <Input {...p} type="date" min={todayIso()} value={state.date} className="h-11" onChange={(e) => set({ date: e.target.value })} />}
          </Field>
          {state.multiDay ? (
            <Field label="Last day" required error={errors.endDate}>
              {(p) => <Input {...p} type="date" min={state.date || todayIso()} value={state.endDate} className="h-11" onChange={(e) => set({ endDate: e.target.value })} />}
            </Field>
          ) : null}
        </div>
        <SwitchField
          label="Runs over more than one day"
          description="Festivals, conferences and markets that come back each day."
          checked={state.multiDay}
          onCheckedChange={(multiDay) => set({ multiDay, endDate: multiDay ? state.endDate : "" })}
          className="min-h-11 rounded-lg border border-border px-4 py-3"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Starts" required error={errors.startTime}>
            {(p) => <Input {...p} type="time" value={state.startTime} className="h-11" onChange={(e) => set({ startTime: e.target.value })} />}
          </Field>
          <Field label="Ends" required error={errors.endTime} hint={state.multiDay ? "Each day." : undefined}>
            {(p) => <Input {...p} type="time" value={state.endTime} className="h-11" onChange={(e) => set({ endTime: e.target.value })} />}
          </Field>
          <Field label="Doors open" optional error={errors.doorsOpen} hint="Leave blank if guests arrive at the start.">
            {(p) => <Input {...p} type="time" value={state.doorsOpen} className="h-11" onChange={(e) => set({ doorsOpen: e.target.value })} />}
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Where</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Venue" required error={errors.venue} hint="The name guests will recognise." className="sm:col-span-2">
            {(p) => <Input {...p} value={state.venue} placeholder="e.g. Camp Kigali Courtyard" className="h-11" onChange={(e) => set({ venue: e.target.value })} />}
          </Field>
          <Field label="Town or park" required error={errors.place}>
            {(p) => (
              <Select {...p} value={state.place} className="h-11" onChange={(e) => set({ place: e.target.value as RwandaPlace | "" })}>
                <option value="">Choose a place</option>
                {PLACES.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            )}
          </Field>
          <Field label="Address" required error={errors.address} hint="Street or landmark, the way a moto driver would know it.">
            {(p) => <Input {...p} value={state.address} placeholder="e.g. KN 3 Ave, Nyarugenge" className="h-11" onChange={(e) => set({ address: e.target.value })} />}
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Who can come</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Age restriction" hint="Shown clearly on the event page so nobody travels for nothing.">
            {(p) => (
              <Select {...p} value={state.ageRestriction} className="h-11" onChange={(e) => set({ ageRestriction: e.target.value as AgeOption })}>
                {AGE_OPTIONS.map((a) => <option key={a || "none"} value={a}>{AGE_LABEL[a]}</option>)}
              </Select>
            )}
          </Field>
        </div>
      </section>
    </div>
  );
}
