import { Bus, CalendarDays, Clock, MapPin, Users, Utensils, Zap, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FillMeter } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRelativeDay, formatRwf, formatTimeRange, pluralize, shiftHours } from "@/lib/utils";
import type { Shift } from "@/types";

interface ShiftFactsProps {
  shift: Shift;
  /** Seats already taken (confirmed, checked in or completed). */
  confirmed: number;
  bookingsLoading: boolean;
}

/** Key facts grid: pay is the hero, then when / where / how many. */
export function ShiftFacts({ shift, confirmed, bookingsLoading }: ShiftFactsProps) {
  const hours = shiftHours(shift.startTime, shift.endTime, shift.breakMinutes);
  const extras = shift.mealProvided || shift.transportAllowance;

  return (
    <Card className="p-4 sm:p-5">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
        <div className="col-span-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <dt className="text-xs font-medium text-fg-muted">Pay per shift</dt>
            <dd className="mt-1 font-display text-[28px] font-semibold leading-none tracking-tight text-navy-900 tabular">{formatRwf(shift.payPerShift)}</dd>
          </div>
          {extras ? (
            <div className="flex flex-wrap gap-1.5">
              {shift.mealProvided ? <Badge tone="success"><Utensils aria-hidden /> Meal provided</Badge> : null}
              {shift.transportAllowance ? <Badge tone="navy"><Bus aria-hidden /> {formatRwf(shift.transportAllowance)} transport</Badge> : null}
            </div>
          ) : null}
        </div>

        <Fact icon={CalendarDays} label="Date" value={formatRelativeDay(shift.date)} sub={formatDate(shift.date)} />
        <Fact icon={Clock} label="Time" value={formatTimeRange(shift.startTime, shift.endTime)} sub={`${hours}h${shift.breakMinutes ? ` · ${shift.breakMinutes} min break` : ""}`} />
        <Fact icon={MapPin} label="Location" value={shift.venue} sub={`${shift.district}, Kigali`} />
        <Fact
          icon={Users}
          label="Workers needed"
          value={pluralize(shift.workersNeeded, "worker")}
          sub={shift.urgent ? <span className="inline-flex items-center gap-1 font-medium text-amber-700"><Zap className="size-3 fill-current" aria-hidden /> Urgent — filling fast</span> : "Flat rate, paid to MoMo"}
        />

        <div className="col-span-2 border-t border-border pt-4">
          <dt className="sr-only">Positions confirmed</dt>
          <dd>{bookingsLoading ? <Skeleton className="h-7 w-full" /> : <FillMeter filled={confirmed} needed={shift.workersNeeded} />}</dd>
        </div>
      </dl>
    </Card>
  );
}

function Fact({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs font-medium text-fg-muted">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-fg">{value}</dd>
        {sub ? <dd className="mt-0.5 text-xs text-fg-muted tabular">{sub}</dd> : null}
      </div>
    </div>
  );
}
