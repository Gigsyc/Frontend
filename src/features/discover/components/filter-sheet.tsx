"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckboxField, SwitchField } from "@/components/ui/checkbox";
import { Dialog, SheetContent } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { DISTRICTS } from "@/data/roles";
import { useOpenShifts } from "@/features/shifts/queries";
import { formatRwf } from "@/lib/utils";
import type { KigaliDistrict, RoleCategory } from "@/types";
import { DEFAULT_STATE, MIN_PAY_OPTIONS, SORT_OPTIONS, toShiftFilters, type DiscoverState, type SortKey } from "../filters";

type SheetFields = Pick<DiscoverState, "districts" | "minPay" | "urgentOnly" | "sort">;

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: DiscoverState;
  skills: RoleCategory[];
  onApply: (patch: SheetFields) => void;
}

/** Drawer for the less-frequent filters. Edits a draft; the live count shows what "Apply" will return. */
export function FilterSheet({ open, onOpenChange, state, skills, onApply }: FilterSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? <FilterSheetBody state={state} skills={skills} onApply={(p) => { onApply(p); onOpenChange(false); }} /> : null}
    </Dialog>
  );
}

function FilterSheetBody({ state, skills, onApply }: Omit<FilterSheetProps, "open" | "onOpenChange">) {
  const [draft, setDraft] = useState<SheetFields>({ districts: state.districts, minPay: state.minPay, urgentOnly: state.urgentOnly, sort: state.sort });
  const preview = useOpenShifts(toShiftFilters({ ...state, ...draft }, skills));
  const count = preview.data?.length;

  const toggleDistrict = (d: KigaliDistrict) =>
    setDraft((s) => ({ ...s, districts: s.districts.includes(d) ? s.districts.filter((x) => x !== d) : [...s.districts, d] }));

  const reset = () => setDraft({ districts: DEFAULT_STATE.districts, minPay: DEFAULT_STATE.minPay, urgentOnly: DEFAULT_STATE.urgentOnly, sort: DEFAULT_STATE.sort });

  return (
    <SheetContent title="Filters" description="Narrow the feed to what suits you.">
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-6 px-5 py-5">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-fg">District</legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {DISTRICTS.map((d) => (
                <CheckboxField key={d} label={<span className="font-normal">{d}</span>} checked={draft.districts.includes(d)} onCheckedChange={() => toggleDistrict(d)} className="min-h-6" />
              ))}
            </div>
          </fieldset>

          <Field label="Minimum pay per shift">
            {(p) => (
              <Select {...p} value={draft.minPay ?? ""} onChange={(e) => setDraft((s) => ({ ...s, minPay: e.target.value ? Number(e.target.value) : undefined }))}>
                <option value="">Any pay</option>
                {MIN_PAY_OPTIONS.map((v) => <option key={v} value={v}>{formatRwf(v)} or more</option>)}
              </Select>
            )}
          </Field>

          <SwitchField label="Urgent shifts only" description="Employers need these filled in the next day or two." checked={draft.urgentOnly} onCheckedChange={(v) => setDraft((s) => ({ ...s, urgentOnly: v }))} />

          <Field label="Sort by">
            {(p) => (
              <Select {...p} value={draft.sort} onChange={(e) => setDraft((s) => ({ ...s, sort: e.target.value as SortKey }))}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            )}
          </Field>
        </div>

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <Button variant="ghost" onClick={reset}>Reset</Button>
          <Button className="flex-1" onClick={() => onApply(draft)} disabled={preview.isPending}>
            {count === undefined ? "Show shifts" : count === 0 ? "No shifts match" : `Show ${count} shift${count === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>
    </SheetContent>
  );
}
