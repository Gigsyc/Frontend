"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button, Card, CardContent, DataList, Photo, SectionHeading } from "@/components/ui";
import { formatDayLong, formatRwf, formatTimeRange, shiftHours } from "@/lib/utils";
import type { Shift } from "@/types";
import { CHECK_IN_LABEL } from "./shift-helpers";

export function JobOverviewTab({ shift }: { shift: Shift }) {
  const hours = shiftHours(shift.startTime, shift.endTime, shift.breakMinutes);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardContent>
            <DataList
              columns={2}
              items={[
                { label: "When", value: <>{formatDayLong(shift.date)}<br /><span className="tabular text-fg-muted">{formatTimeRange(shift.startTime, shift.endTime)} · {Number.isInteger(hours) ? hours : hours.toFixed(1)}h{shift.breakMinutes ? ` incl. ${shift.breakMinutes} min break` : ""}</span></> },
                { label: "Where", value: <>{shift.venue}<br /><span className="text-fg-muted">{shift.address}, {shift.district}</span></> },
                { label: "Supervisor on the day", value: <>{shift.supervisor.name}<br /><a href={`tel:${shift.supervisor.phone.replace(/\s/g, "")}`} className="tabular text-navy-700 hover:underline">{shift.supervisor.phone}</a></> },
                { label: "Check-in", value: CHECK_IN_LABEL[shift.checkInMethod] },
                { label: "Pay per shift", value: <span className="font-display font-semibold text-navy-900 tabular">{formatRwf(shift.payPerShift)}</span> },
                { label: "Transport", value: shift.transportAllowance ? <span className="tabular">{formatRwf(shift.transportAllowance)} allowance</span> : "Not included" },
                { label: "Meal", value: shift.mealProvided ? "Provided" : "Not provided" },
                { label: "Dress code", value: shift.dressCode ?? "None specified" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6">
            <div>
              <SectionHeading as="h3" title="Description" />
              <p className="mt-2 text-sm leading-6 text-fg">{shift.description}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <SectionHeading as="h3" title="Responsibilities" />
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-fg">{shift.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div>
                <SectionHeading as="h3" title="Requirements" />
                {shift.requirements.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-fg">{shift.requirements.map((r) => <li key={r}>{r}</li>)}</ul> : <p className="mt-2 text-sm text-fg-muted">No hard requirements.</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Photo src={shift.coverImage} alt={`${shift.venue}, ${shift.district}`} aspect="video" sizes="(max-width: 1024px) 100vw, 360px" />
        <Card>
          <CardContent className="space-y-3">
            <p className="text-sm text-fg-muted">Workers see a shorter version of this page with pay first and the address hidden until they&apos;re confirmed.</p>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href={`/worker/shifts/${shift.id}`}><ExternalLink /> See what workers see</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
