"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, SheetContent } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { Segmented } from "@/components/ui/tabs";
import { PLACES } from "@/data/events";
import { pluralize } from "@/lib/utils";
import type { RwandaPlace } from "@/types";
import {
  PRICE_OPTIONS, SORT_OPTIONS, sheetFilterCount,
  type EventSort, type EventsFilterState, type PriceFilter,
} from "../../hooks";

interface FilterBarProps {
  state: EventsFilterState;
  onChange: (patch: Partial<EventsFilterState>) => void;
  /** Result count for the sheet's confirm button; undefined while loading. */
  resultCount: number | undefined;
}

/** Place, price and sort. A row on desktop; one "Filters" button and a sheet under sm. */
export function FilterBar({ state, onChange, resultCount }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const count = sheetFilterCount(state);

  return (
    <>
      <div className="hidden flex-wrap items-center gap-3 sm:flex">
        <PlaceSelect value={state.place} onChange={(place) => onChange({ place })} className="w-44" />
        <Segmented
          ariaLabel="Price"
          value={state.price}
          options={PRICE_OPTIONS}
          onChange={(price: PriceFilter) => onChange({ price })}
          className="h-10 p-1"
        />
        <SortSelect value={state.sort} onChange={(sort) => onChange({ sort })} className="ml-auto w-52" />
      </div>

      <div className="sm:hidden">
        <Button variant="outline" size="lg" className="w-full justify-between" onClick={() => setOpen(true)}>
          <span className="inline-flex items-center gap-2"><SlidersHorizontal /> Filters</span>
          {count ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-navy-900 px-1.5 text-[11px] font-semibold leading-5 text-white tabular">{count}</span>
          ) : (
            <span className="text-[13px] font-normal text-fg-muted">Place, price, sort</span>
          )}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        {open ? (
          <SheetContent title="Filters" description="Narrow the board to what you're after.">
            <div className="flex h-full flex-col">
              <div className="flex-1 space-y-6 px-5 py-5">
                <Field label="Place">
                  {(p) => <PlaceSelect {...p} value={state.place} onChange={(place) => onChange({ place })} />}
                </Field>
                <fieldset className="flex flex-col gap-1.5">
                  <legend className="text-sm font-medium text-fg">Price</legend>
                  <Segmented
                    ariaLabel="Price"
                    value={state.price}
                    options={PRICE_OPTIONS}
                    onChange={(price: PriceFilter) => onChange({ price })}
                    className="h-12 w-full p-1 [&>button]:h-10 [&>button]:flex-1"
                  />
                </fieldset>
                <Field label="Sort by">
                  {(p) => <SortSelect {...p} value={state.sort} onChange={(sort) => onChange({ sort })} />}
                </Field>
              </div>
              <div className="flex gap-2 border-t border-border px-5 py-4">
                <Button variant="ghost" size="lg" onClick={() => onChange({ place: "all", price: "all", sort: "soonest" })}>Reset</Button>
                <Button size="lg" className="flex-1" onClick={() => setOpen(false)}>
                  {resultCount === undefined ? "Show events" : resultCount === 0 ? "No events match" : `Show ${pluralize(resultCount, "event")}`}
                </Button>
              </div>
            </div>
          </SheetContent>
        ) : null}
      </Dialog>
    </>
  );
}

/** The a11y props the `Field` render-prop hands its control. */
interface FieldWiring {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  required?: boolean;
}

function PlaceSelect({ value, onChange, className, ...wiring }: FieldWiring & {
  value: RwandaPlace | "all";
  onChange: (v: RwandaPlace | "all") => void;
  className?: string;
}) {
  return (
    <Select
      {...wiring}
      aria-label={wiring.id ? undefined : "Place"}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value as RwandaPlace | "all")}
    >
      <option value="all">All places</option>
      {PLACES.map((p) => <option key={p} value={p}>{p}</option>)}
    </Select>
  );
}

function SortSelect({ value, onChange, className, ...wiring }: FieldWiring & {
  value: EventSort;
  onChange: (v: EventSort) => void;
  className?: string;
}) {
  return (
    <Select
      {...wiring}
      aria-label={wiring.id ? undefined : "Sort events"}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value as EventSort)}
    >
      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );
}
