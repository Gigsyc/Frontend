"use client";

import { MapPin, QrCode, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Field, Input, Select } from "@/components/ui";
import { DISTRICTS } from "@/data/roles";
import { cn, shiftHours } from "@/lib/utils";
import type { KigaliDistrict, Shift } from "@/types";
import type { WizardState } from "../state";
import { todayIso, type StepErrors } from "../validation";

interface StepWhenWhereProps {
  state: WizardState;
  errors: StepErrors;
  set: (patch: Partial<WizardState>) => void;
}

const CHECK_IN: Array<{ value: Shift["checkInMethod"]; label: string; help: string; icon: LucideIcon }> = [
  { value: "qr", label: "QR code", help: "Workers scan a code at the venue on arrival.", icon: QrCode },
  { value: "supervisor", label: "Supervisor confirms", help: "Your supervisor ticks people off in the app.", icon: UserCheck },
  { value: "gps", label: "GPS", help: "Check-in unlocks when the worker's phone is at the address.", icon: MapPin },
];

const BREAKS = [0, 15, 30, 45, 60];

export function hoursLabel(start: string, end: string, breakMinutes: number) {
  if (!start || !end) return null;
  const h = shiftHours(start, end, breakMinutes);
  if (h <= 0) return null;
  const overnight = end < start;
  return `${Number.isInteger(h) ? h : h.toFixed(1)}h shift${overnight ? " · overnight" : ""}`;
}

export function StepWhenWhere({ state, errors, set }: StepWhenWhereProps) {
  const hours = hoursLabel(state.startTime, state.endTime, state.breakMinutes);
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold">When</h2>
          {hours ? <span className="rounded-sm bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-800 tabular">{hours}</span> : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Date" required error={errors.date}>
            {(p) => <Input {...p} type="date" min={todayIso()} value={state.date} onChange={(e) => set({ date: e.target.value })} />}
          </Field>
          <Field label="Start" required error={errors.startTime}>
            {(p) => <Input {...p} type="time" value={state.startTime} onChange={(e) => set({ startTime: e.target.value })} />}
          </Field>
          <Field label="End" required error={errors.endTime}>
            {(p) => <Input {...p} type="time" value={state.endTime} onChange={(e) => set({ endTime: e.target.value })} />}
          </Field>
          <Field label="Break" error={errors.breakMinutes}>
            {(p) => (
              <Select {...p} value={state.breakMinutes} onChange={(e) => set({ breakMinutes: Number(e.target.value) })}>
                {BREAKS.map((b) => <option key={b} value={b}>{b === 0 ? "No break" : `${b} min`}</option>)}
              </Select>
            )}
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Where</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Venue" required error={errors.venue} className="sm:col-span-2">
            {(p) => <Input {...p} value={state.venue} placeholder="e.g. Umucyo Banquet Hall, Ikaze Kimihurura" onChange={(e) => set({ venue: e.target.value })} />}
          </Field>
          <Field label="District" required error={errors.district}>
            {(p) => (
              <Select {...p} value={state.district} onChange={(e) => set({ district: e.target.value as KigaliDistrict | "" })}>
                <option value="">Choose a district</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            )}
          </Field>
          <Field label="Address" required error={errors.address} hint="Street or landmark. Shown to confirmed workers only.">
            {(p) => <Input {...p} value={state.address} placeholder="e.g. KG 7 Ave, opposite the petrol station" onChange={(e) => set({ address: e.target.value })} />}
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">On the day</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Supervisor" required error={errors.supervisorName} hint="Who workers report to when they arrive.">
            {(p) => <Input {...p} value={state.supervisorName} autoComplete="name" onChange={(e) => set({ supervisorName: e.target.value })} />}
          </Field>
          <Field label="Supervisor phone" required error={errors.supervisorPhone}>
            {(p) => <Input {...p} type="tel" inputMode="tel" value={state.supervisorPhone} placeholder="+250 788 000 000" onChange={(e) => set({ supervisorPhone: e.target.value })} />}
          </Field>
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-fg">Check-in method</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {CHECK_IN.map((m) => {
              const active = state.checkInMethod === m.value;
              return (
                <label
                  key={m.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-[:focus-visible]:shadow-focus",
                    active ? "border-navy-900 bg-navy-50" : "border-border bg-surface hover:border-ink-400",
                  )}
                >
                  <input type="radio" name="checkInMethod" value={m.value} checked={active} onChange={() => set({ checkInMethod: m.value })} className="sr-only" />
                  <m.icon className={cn("mt-0.5 size-4 shrink-0", active ? "text-navy-900" : "text-fg-muted")} aria-hidden />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-fg">{m.label}</span>
                    <span className="text-xs leading-4 text-fg-muted">{m.help}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>
    </div>
  );
}
