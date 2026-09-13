"use client";

import { BarChart, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { formatRwf } from "@/lib/utils";
import type { MonthPoint } from "../types";

/** Six months of paid earnings; the current month is highlighted. Months before the data began are zero, not guessed. */
export function MonthlyChart({ months }: { months: MonthPoint[] }) {
  const firstWithData = months.findIndex((m) => m.paid > 0);
  const quietMonths = firstWithData > 0 ? firstWithData : 0;
  const data = months.map((m) => ({ label: m.label, value: m.paid, hint: m.hint }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paid by month</CardTitle>
        <CardDescription>
          {quietMonths > 0
            ? `Your first GigSyc payout was in ${months[firstWithData].hint}. Earlier months show zero.`
            : "What reached your MoMo each month, transport allowances included."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <BarChart
          data={data}
          highlight={months.length - 1}
          height={140}
          format={(v) => formatRwf(v, { compact: true })}
          ariaLabel="Paid earnings per month for the last six months"
        />
      </CardContent>
    </Card>
  );
}
