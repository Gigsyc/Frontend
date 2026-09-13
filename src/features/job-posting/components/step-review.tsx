"use client";

import { ShiftCard } from "@/components/common";
import { Card, CardContent, DataList } from "@/components/ui";
import { ROLES, SERVICE_FEE_RATE } from "@/data/roles";
import { formatDayLong, formatRwf, formatTimeRange, pluralize } from "@/lib/utils";
import type { Employer } from "@/types";
import { previewShift } from "../build-shift";
import type { WizardState } from "../state";
import { hoursLabel } from "./step-when-where";

interface StepReviewProps {
  state: WizardState;
  employer?: Employer;
  employerId: string;
}

export function costBreakdown(s: WizardState) {
  const pay = Number(s.pay) || 0;
  const transport = Number(s.transport) || 0;
  const workerPay = s.workersNeeded * pay;
  const transportTotal = s.workersNeeded * transport;
  const subtotal = workerPay + transportTotal;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE);
  return { pay, transport, workerPay, transportTotal, subtotal, fee, total: subtotal + fee };
}

export function StepReview({ state, employer, employerId }: StepReviewProps) {
  const shift = previewShift(state, employerId);
  const cost = costBreakdown(state);
  const checkIn = { qr: "QR code at the venue", supervisor: "Supervisor confirms", gps: "GPS from the worker's phone" }[state.checkInMethod];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <div>
          <h2 className="text-base font-semibold">What workers will see</h2>
          <p className="mt-0.5 text-sm text-fg-muted">This is the card on their Discover feed. Tap Back to change anything.</p>
        </div>
        <ShiftCard shift={shift} employer={employer} href="#" className="pointer-events-none" />
        <Card>
          <CardContent>
            <DataList
              columns={2}
              items={[
                { label: "When", value: state.date ? `${formatDayLong(state.date)} · ${formatTimeRange(state.startTime, state.endTime)}` : "—" },
                { label: "Length", value: hoursLabel(state.startTime, state.endTime, state.breakMinutes) ?? "—" },
                { label: "Where", value: `${state.venue}, ${state.district}` },
                { label: "Supervisor", value: `${state.supervisorName} · ${state.supervisorPhone}` },
                { label: "Check-in", value: checkIn },
                { label: "Posted to", value: state.postTo === "pool" ? "Talent pool first" : "Everyone with this skill" },
                { label: "Meal", value: state.mealProvided ? "Provided" : "Not provided" },
                { label: "Dress code", value: state.dressCode || "None specified" },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="self-start lg:col-span-2">
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Estimated cost</h2>
            <p className="mt-0.5 text-sm text-fg-muted">You&apos;re invoiced after the shift, for workers who actually turned up.</p>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-fg-muted">{pluralize(state.workersNeeded, state.role ? ROLES[state.role].short.toLowerCase() : "worker")} × {formatRwf(cost.pay)}</dt>
              <dd className="font-medium tabular">{formatRwf(cost.workerPay)}</dd>
            </div>
            {cost.transport > 0 ? (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-fg-muted">Transport × {state.workersNeeded}</dt>
                <dd className="font-medium tabular">{formatRwf(cost.transportTotal)}</dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-fg-muted">GigSyc service fee ({Math.round(SERVICE_FEE_RATE * 100)}%)</dt>
              <dd className="font-medium tabular">{formatRwf(cost.fee)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
              <dt className="font-semibold text-fg">Estimated total</dt>
              <dd className="font-display text-xl font-semibold text-navy-900 tabular">{formatRwf(cost.total)}</dd>
            </div>
          </dl>
          <p className="text-xs leading-5 text-fg-muted">
            Workers are paid {formatRwf(cost.pay + cost.transport)} each to MTN MoMo or Airtel Money once you approve the shift. Nothing is charged today.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
