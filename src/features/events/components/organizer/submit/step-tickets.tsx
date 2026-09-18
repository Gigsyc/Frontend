"use client";

import { ClipboardList, DoorOpen, Plus, Ticket, X, type LucideIcon } from "lucide-react";
import { Button, CheckboxField, Field, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { AttendanceMode } from "@/types";
import { LineList } from "./line-list";
import { ACCESSIBILITY_DEFAULTS, type SubmitState } from "./state";
import { CAPACITY_MIN, GOOD_TO_KNOW_MAX, type StepErrors } from "./validation";
import { TierEditor } from "./tier-editor";

interface StepTicketsProps {
  state: SubmitState;
  errors: StepErrors;
  set: (patch: Partial<SubmitState>) => void;
}

const MODES: Array<{ value: AttendanceMode; label: string; help: string; icon: LucideIcon }> = [
  { value: "free", label: "Free entry", help: "Anyone can turn up. No list, no tickets.", icon: DoorOpen },
  { value: "register", label: "Registration", help: "Free, but we count heads so you know who's coming.", icon: ClipboardList },
  { value: "tickets", label: "Tickets", help: "Guests buy a ticket type you set below.", icon: Ticket },
];

const digitsOnly = (v: string) => v.replace(/[^\d]/g, "");

export function StepTickets({ state, errors, set }: StepTicketsProps) {
  const toggleDefault = (line: string, on: boolean) =>
    set({ accessibility: on ? ACCESSIBILITY_DEFAULTS.filter((a) => a === line || state.accessibility.includes(a)) : state.accessibility.filter((a) => a !== line) });
  const setExtra = (i: number, v: string) => set({ accessibilityExtra: state.accessibilityExtra.map((x, idx) => (idx === i ? v : x)) });

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-base font-semibold">How guests get in</h2>
        <fieldset>
          <legend className="sr-only">Attendance</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {MODES.map((m) => {
              const active = state.attendanceMode === m.value;
              return (
                <label
                  key={m.value}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-150 has-[:focus-visible]:shadow-focus",
                    active ? "border-navy-900 bg-navy-50" : "border-border bg-surface hover:border-ink-400",
                  )}
                >
                  <input type="radio" name="attendanceMode" value={m.value} checked={active} onChange={() => set({ attendanceMode: m.value })} className="sr-only" />
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
        {state.attendanceMode === "tickets" ? <TierEditor tiers={state.tiers} onChange={(tiers) => set({ tiers })} error={errors.tiers} /> : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Room</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Capacity" required error={errors.capacity} hint={`Total guests you can host, at least ${CAPACITY_MIN}. We stop registrations when it's reached.`}>
            {(p) => (
              <Input
                {...p}
                inputMode="numeric"
                value={state.capacity}
                placeholder="e.g. 300"
                className="h-11 font-display font-semibold tabular"
                onChange={(e) => set({ capacity: digitsOnly(e.target.value) })}
              />
            )}
          </Field>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-base font-semibold">Practicalities</h2>
        <LineList
          label="Good to know"
          singular="note"
          optional
          items={state.goodToKnow}
          onChange={(goodToKnow) => set({ goodToKnow })}
          max={GOOD_TO_KNOW_MAX}
          maxLength={120}
          placeholder="e.g. Moto and cab drop-off is at the main gate."
          error={errors.goodToKnow}
          hint="Parking, queues, what to bring. Delete anything that doesn't apply."
        />

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium text-fg">Accessibility</legend>
          {ACCESSIBILITY_DEFAULTS.map((line) => (
            <CheckboxField key={line} label={line} checked={state.accessibility.includes(line)} onCheckedChange={(v) => toggleDefault(line, v === true)} className="min-h-11 items-center" />
          ))}
          {state.accessibilityExtra.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input aria-label={`Accessibility note ${i + 1}`} value={line} maxLength={80} placeholder="e.g. Sign-language interpreter for the opening set" onChange={(e) => setExtra(i, e.target.value)} className="h-11" />
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove accessibility note ${i + 1}`} onClick={() => set({ accessibilityExtra: state.accessibilityExtra.filter((_, idx) => idx !== i) })} className="size-11 shrink-0 text-fg-muted">
                <X />
              </Button>
            </div>
          ))}
          <div>
            <Button type="button" variant="ghost" size="sm" onClick={() => set({ accessibilityExtra: [...state.accessibilityExtra, ""] })} disabled={state.accessibilityExtra.length >= 4} className="-ml-2 h-11 text-navy-700">
              <Plus /> Add another
            </Button>
          </div>
        </fieldset>
      </section>
    </div>
  );
}
