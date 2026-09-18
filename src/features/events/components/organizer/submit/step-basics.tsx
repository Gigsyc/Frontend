"use client";

import { CategoryIcon } from "@/components/common";
import { Field, Input, Textarea } from "@/components/ui";
import { CATEGORY_LIST } from "@/data/events";
import { cn } from "@/lib/utils";
import { LineList } from "./line-list";
import type { SubmitState } from "./state";
import { DESCRIPTION_MIN, HIGHLIGHTS_MAX, TAGLINE_MAX, TITLE_MAX, type StepErrors } from "./validation";

interface StepBasicsProps {
  state: SubmitState;
  errors: StepErrors;
  set: (patch: Partial<SubmitState>) => void;
}

function Counter({ value, max, className }: { value: number; max: number; className?: string }) {
  return <span className={cn("text-xs tabular", value > max ? "text-danger-600" : "text-fg-subtle", className)}>{value}/{max}</span>;
}

export function StepBasics({ state, errors, set }: StepBasicsProps) {
  const descLength = state.description.trim().length;
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="relative">
          <Field label="Event title" required error={errors.title} hint="The name people will search for. Keep it as it appears on your posters.">
            {(p) => (
              <Input
                {...p}
                value={state.title}
                maxLength={TITLE_MAX}
                placeholder="e.g. Kigali Jazz Junction"
                className="h-11 pr-16 text-base"
                onChange={(e) => set({ title: e.target.value })}
              />
            )}
          </Field>
          <Counter value={state.title.length} max={TITLE_MAX} className="absolute right-3 top-9" />
        </div>

        <div className="relative">
          <Field label="Tagline" required error={errors.tagline} hint="The one line people see on the card — what makes this night worth leaving the house for.">
            {(p) => (
              <Input
                {...p}
                value={state.tagline}
                maxLength={TAGLINE_MAX}
                placeholder="e.g. Four bands, one courtyard, from sundown to late."
                className="h-11 pr-20"
                onChange={(e) => set({ tagline: e.target.value })}
              />
            )}
          </Field>
          <Counter value={state.tagline.length} max={TAGLINE_MAX} className="absolute right-3 top-9" />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-fg">
          Category <span className="text-danger-500">*</span>
        </legend>
        <p className="mt-0.5 text-[13px] text-fg-muted">Guests browse by category, so pick the one they would look under.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORY_LIST.map((c) => {
            const active = state.category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => set({ category: c.id })}
                className={cn(
                  "flex min-h-11 flex-col items-start gap-2 rounded-lg border p-3 text-left transition-[border-color,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:shadow-focus",
                  active ? "border-navy-900 bg-navy-50 shadow-card" : "border-border bg-surface hover:border-ink-400 hover:bg-ink-50",
                )}
              >
                <CategoryIcon category={c.id} size="sm" className={cn(active && "bg-navy-900 text-white")} />
                <span className="text-sm font-semibold leading-5 text-fg">{c.label}</span>
                <span className="line-clamp-2 text-xs leading-4 text-fg-muted">{c.blurb}</span>
              </button>
            );
          })}
        </div>
        {errors.category ? <p role="alert" className="mt-2 text-[13px] text-danger-600">{errors.category}</p> : null}
      </fieldset>

      <div className="relative">
        <Field
          label="Description"
          required
          error={errors.description}
          hint={descLength < DESCRIPTION_MIN ? `A paragraph or two. ${DESCRIPTION_MIN - descLength} more characters to go.` : "What happens, who it's for, and anything a first-timer should know."}
        >
          {(p) => (
            <Textarea
              {...p}
              value={state.description}
              rows={5}
              placeholder="The monthly Jazz Junction returns to Camp Kigali with a line-up spanning rumba, contemporary jazz and a closing Afro-soul set…"
              onChange={(e) => set({ description: e.target.value })}
            />
          )}
        </Field>
      </div>

      <LineList
        label="What to expect"
        singular="highlight"
        items={state.highlights}
        onChange={(highlights) => set({ highlights })}
        min={1}
        max={HIGHLIGHTS_MAX}
        placeholder="e.g. Four live sets across one stage"
        error={errors.highlights}
        hint="Short lines, shown as bullets on the event page."
      />
    </div>
  );
}
