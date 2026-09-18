import { Briefcase, Percent, Radio, Users } from "lucide-react";
import { Stat } from "@/components/ui/stat";
import type { EmployerSummary } from "@/features/analytics";
import { formatNumber, pluralize } from "@/lib/utils";
import type { GuestsThisMonth } from "../events";

const FILL_TARGET = 95;

interface Props {
  summary: EmployerSummary;
  guests: GuestsThisMonth;
  liveEvents: number;
}

/** Four tiles, both sides of the business, guests first. Never a fifth. */
export function OverviewStats({ summary, guests, liveEvents }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Guests this month"
        value={formatNumber(guests.guests)}
        icon={Users}
        hint={guests.events ? `Across ${pluralize(guests.events, "event")} in ${guests.monthName}, finished ones included` : `No live events in ${guests.monthName} yet`}
      />
      <Stat
        label="Live events"
        value={liveEvents}
        icon={Radio}
        hint={liveEvents ? "Published on GigSyc and still to come" : "Nothing live yet — submit one and GigSyc reviews it"}
      />
      <Stat
        label="Open positions"
        value={summary.openPositions}
        icon={Briefcase}
        hint={summary.upcomingShifts ? `Across ${pluralize(summary.upcomingShifts, "upcoming shift")}` : "No upcoming shifts posted"}
      />
      <Stat
        label="Fill rate"
        value={`${summary.fillRate}%`}
        icon={Percent}
        delta={summary.fillRate ? { value: summary.fillRate - FILL_TARGET, label: " pts" } : undefined}
        hint={`Target ${FILL_TARGET}% · your completed shifts`}
      />
    </div>
  );
}
