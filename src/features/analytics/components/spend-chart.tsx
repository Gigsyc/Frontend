"use client";

import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRwf, pluralize } from "@/lib/utils";
import type { EmployerSummary } from "../compute";

export function SpendChart({ weeks, label }: { weeks: EmployerSummary["weeklySpend"]; label: string }) {
  const total = weeks.reduce((a, w) => a + w.amount, 0);
  const shifts = weeks.reduce((a, w) => a + w.shifts, 0);
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Worker pay by week</CardTitle>
          <CardDescription>{label} · completed shifts, before the 18% service fee</CardDescription>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold leading-none text-navy-900 tabular">{formatRwf(total, { compact: true })}</p>
          <p className="mt-1 text-xs text-fg-muted">{pluralize(shifts, "shift")}</p>
        </div>
      </CardHeader>
      {shifts === 0 ? (
        <EmptyState
          compact
          icon={BarChart3}
          title={`No completed shifts in the ${label.toLowerCase()}`}
          description="Worker pay shows here once a shift finishes and you approve the workers on it."
        />
      ) : (
        <CardContent className="pt-8">
          <BarChart
            data={weeks.map((w) => ({ label: w.label, value: w.amount, hint: `${w.label} · ${pluralize(w.shifts, "shift")}` }))}
            format={(v) => formatRwf(v, { compact: true })}
            highlight={weeks.length - 1}
            height={180}
            ariaLabel={`Worker pay per week, ${label}`}
          />
        </CardContent>
      )}
    </Card>
  );
}
