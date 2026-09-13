import { Briefcase, Percent, Users, Wallet } from "lucide-react";
import { Stat } from "@/components/ui/stat";
import type { EmployerSummary } from "@/features/analytics";
import { formatRwf, pluralize } from "@/lib/utils";

const FILL_TARGET = 95;

export function OverviewStats({ summary, confirmedThisWeek, shiftsThisWeek }: { summary: EmployerSummary; confirmedThisWeek: number; shiftsThisWeek: number }) {
  const spendDelta = summary.spendLastMonth
    ? Math.round(((summary.spendThisMonth - summary.spendLastMonth) / summary.spendLastMonth) * 100)
    : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Open positions"
        value={summary.openPositions}
        icon={Briefcase}
        hint={summary.upcomingShifts ? `Across ${pluralize(summary.upcomingShifts, "upcoming shift")}` : "No upcoming shifts posted"}
      />
      <Stat
        label="Confirmed this week"
        value={confirmedThisWeek}
        icon={Users}
        hint={shiftsThisWeek ? `Workers on ${pluralize(shiftsThisWeek, "shift")} in the next 7 days` : "Nothing scheduled in the next 7 days"}
      />
      <Stat
        label="Fill rate"
        value={`${summary.fillRate}%`}
        icon={Percent}
        delta={summary.fillRate ? { value: summary.fillRate - FILL_TARGET, label: " pts" } : undefined}
        hint={`Target ${FILL_TARGET}% · completed shifts`}
      />
      <Stat
        label="Spend this month"
        value={formatRwf(summary.spendThisMonth, { compact: true })}
        icon={Wallet}
        delta={spendDelta !== undefined ? { value: spendDelta } : undefined}
        hint={summary.spendLastMonth ? `Last month ${formatRwf(summary.spendLastMonth, { compact: true })} · worker pay` : "Worker pay, before the 18% service fee"}
      />
    </div>
  );
}
