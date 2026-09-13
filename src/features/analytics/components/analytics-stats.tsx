import { Clock, Percent, Star, UserCheck, UserX } from "lucide-react";
import { Stat } from "@/components/ui/stat";
import type { EmployerSummary } from "../compute";
import type { Benchmarks } from "./use-analytics-view";

const round1 = (n: number) => Math.round(n * 10) / 10;

export function AnalyticsStats({ summary, benchmarks }: { summary: EmployerSummary; benchmarks: Benchmarks }) {
  const fillDelta = benchmarks.allTimeFillRate !== undefined && summary.fillRate ? summary.fillRate - benchmarks.allTimeFillRate : undefined;
  const ratingDelta = benchmarks.allTimeRatingGiven !== undefined && summary.avgRatingGiven ? round1(summary.avgRatingGiven - benchmarks.allTimeRatingGiven) : undefined;
  const noShowDelta = round1(summary.noShowRate - benchmarks.platformNoShowRate);
  const attendanceDelta = round1(summary.attendanceRate - (100 - benchmarks.platformNoShowRate));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Stat
        label="Fill rate"
        value={`${summary.fillRate}%`}
        icon={Percent}
        delta={fillDelta !== undefined ? { value: fillDelta, label: " pts" } : undefined}
        hint={benchmarks.allTimeFillRate !== undefined ? `vs ${benchmarks.allTimeFillRate}% all-time` : "Completed shifts"}
      />
      <Stat
        label="Avg time to fill"
        value={summary.avgTimeToFillHours ? `${summary.avgTimeToFillHours}h` : "—"}
        icon={Clock}
        hint="From posting to last confirmation"
      />
      <Stat
        label="Attendance"
        value={`${summary.attendanceRate}%`}
        icon={UserCheck}
        delta={{ value: attendanceDelta, label: " pts" }}
        hint={`Platform average ${round1(100 - benchmarks.platformNoShowRate)}%`}
      />
      <Stat
        label="No-show rate"
        value={`${summary.noShowRate}%`}
        icon={UserX}
        delta={{ value: noShowDelta, label: " pts", invert: true }}
        hint={`Platform average ${benchmarks.platformNoShowRate}%`}
      />
      <Stat
        label="Avg rating given"
        value={summary.avgRatingGiven ? summary.avgRatingGiven.toFixed(1) : "—"}
        icon={Star}
        delta={ratingDelta !== undefined && ratingDelta !== 0 ? { value: ratingDelta, label: "" } : undefined}
        hint={benchmarks.allTimeRatingGiven !== undefined ? `vs ${benchmarks.allTimeRatingGiven.toFixed(1)} all-time` : "Across approved shifts"}
      />
    </div>
  );
}
