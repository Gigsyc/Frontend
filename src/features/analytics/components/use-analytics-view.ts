"use client";

import { useMemo } from "react";
import { differenceInCalendarDays, differenceInHours, parseISO } from "date-fns";
import { ROLES } from "@/data/roles";
import { useEmployerBookings } from "@/features/bookings";
import { useEmployer } from "@/features/employers";
import { useEmployerShifts } from "@/features/shifts";
import { useTalentPool } from "@/features/talent-pool";
import { useWorkers } from "@/features/workers";
import { formatRwf, pluralize } from "@/lib/utils";
import type { Booking, Shift, Worker } from "@/types";
import type { EmployerSummary } from "../compute";
import { useEmployerSummary } from "../queries";

export interface EngagedWorker {
  worker: Worker;
  shifts: number;
  avgRating: number;
  lastWorked?: string;
  inPool: boolean;
}

export interface Benchmarks {
  /** Platform-wide no-show rate across every worker profile, % */
  platformNoShowRate: number;
  allTimeFillRate?: number;
  allTimeRatingGiven?: number;
}

function fillHours(shift: Shift, bookings: Booking[]) {
  const confirmed = bookings.filter((b) => b.shiftId === shift.id && b.status !== "applied" && b.status !== "invited");
  if (!confirmed.length) return null;
  const last = confirmed.map((b) => parseISO(b.createdAt)).sort((a, b) => b.getTime() - a.getTime())[0];
  return Math.max(1, differenceInHours(last, parseISO(shift.createdAt)));
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function buildInsights(summary: EmployerSummary, shifts: Shift[], bookings: Booking[], engaged: EngagedWorker[], platformNoShow: number): string[] {
  const out: string[] = [];
  const past = shifts.filter((s) => s.status === "completed");

  const timed = past
    .map((s) => ({ lead: differenceInCalendarDays(parseISO(s.date), parseISO(s.createdAt)), hours: fillHours(s, bookings) }))
    .filter((x): x is { lead: number; hours: number } => x.hours !== null);
  const early = timed.filter((x) => x.lead >= 5).map((x) => x.hours);
  const late = timed.filter((x) => x.lead < 5).map((x) => x.hours);
  if (early.length && late.length && avg(early) < avg(late)) {
    const ratio = avg(late) / avg(early);
    out.push(`Shifts posted 5+ days ahead filled about ${ratio >= 1.5 ? `${ratio.toFixed(1)}× faster` : `${Math.round(avg(late) - avg(early))}h sooner`} than shorter-notice ones (${Math.round(avg(early))}h vs ${Math.round(avg(late))}h).`);
  } else if (timed.length) {
    out.push(`Your completed shifts were posted ${Math.round(avg(timed.map((x) => x.lead)))} days ahead on average and took about ${Math.round(avg(timed.map((x) => x.hours)))}h to fill.`);
  }

  const inPool = engaged.filter((e) => e.inPool).length;
  if (engaged.length) {
    out.push(
      inPool === engaged.length
        ? `All ${engaged.length} of your most engaged workers are in your talent pool, so invites to them confirm instantly.`
        : `${inPool} of your ${engaged.length} most engaged workers are in your talent pool. Adding the rest lets you invite them directly and skip applicant review.`,
    );
  }

  const pastBookings = bookings.filter((b) => past.some((s) => s.id === b.shiftId));
  const completed = pastBookings.filter((b) => b.status === "completed").length;
  const noShows = pastBookings.filter((b) => b.status === "no_show").length;
  if (completed + noShows) {
    const vs = summary.noShowRate <= platformNoShow ? "below" : "above";
    out.push(`${summary.attendanceRate}% attendance: ${pluralize(noShows, "no-show")} across ${pluralize(completed + noShows, "booking")}, ${vs} the platform average of ${platformNoShow.toFixed(1)}%.`);
  }

  const topRole = summary.roleMix[0];
  const totalWorkers = summary.roleMix.reduce((a, r) => a + r.workers, 0);
  if (topRole && totalWorkers) {
    out.push(`${ROLES[topRole.role].label} is your most-booked role: ${Math.round((topRole.workers / totalWorkers) * 100)}% of the ${totalWorkers} workers you've confirmed.`);
  }

  if (summary.spendLastMonth) {
    const pct = Math.round(((summary.spendThisMonth - summary.spendLastMonth) / summary.spendLastMonth) * 100);
    out.push(`Worker pay this month is ${formatRwf(summary.spendThisMonth)}, ${pct >= 0 ? "up" : "down"} ${Math.abs(pct)}% on last month.`);
  }

  return out.slice(0, 3);
}

export function useAnalyticsView(employerId: string) {
  const summary = useEmployerSummary(employerId);
  const employer = useEmployer(employerId);
  const shifts = useEmployerShifts(employerId);
  const bookings = useEmployerBookings(employerId);
  const workers = useWorkers({});
  const pool = useTalentPool(employerId);

  const view = useMemo(() => {
    if (!summary.data || !shifts.data || !bookings.data || !workers.data || !pool.data || !employer.data) return undefined;
    const poolIds = new Set(pool.data.map((p) => p.workerId));
    const engaged: EngagedWorker[] = summary.data.topWorkers.flatMap((t) => {
      const worker = workers.data.find((w) => w.id === t.workerId);
      if (!worker) return [];
      const lastWorked = bookings.data
        .filter((b) => b.workerId === t.workerId && b.status === "completed")
        .map((b) => shifts.data.find((s) => s.id === b.shiftId)?.date)
        .filter((d): d is string => !!d)
        .sort()
        .at(-1);
      return [{ worker, shifts: t.shifts, avgRating: t.avgRating, lastWorked, inPool: poolIds.has(t.workerId) }];
    });
    const totalNoShows = workers.data.reduce((a, w) => a + w.noShows, 0);
    const totalBookings = workers.data.reduce((a, w) => a + w.completedShifts + w.noShows, 0);
    const platformNoShowRate = totalBookings ? Math.round((totalNoShows / totalBookings) * 1000) / 10 : 0;
    const benchmarks: Benchmarks = {
      platformNoShowRate,
      allTimeFillRate: employer.data.stats.fillRate,
      allTimeRatingGiven: employer.data.stats.avgRatingGiven,
    };
    return { engaged, benchmarks, insights: buildInsights(summary.data, shifts.data, bookings.data, engaged, platformNoShowRate) };
  }, [summary.data, shifts.data, bookings.data, workers.data, pool.data, employer.data]);

  return {
    summary: summary.data,
    ...view,
    // Pool and employer feed the Pool badges, the "vs all-time" deltas and the talent-pool insight, so they gate the view too.
    isPending: summary.isPending || shifts.isPending || bookings.isPending || workers.isPending || pool.isPending || employer.isPending,
    isError: summary.isError || shifts.isError || bookings.isError || workers.isError || pool.isError || employer.isError,
    error: summary.error ?? shifts.error ?? bookings.error ?? workers.error ?? pool.error ?? employer.error,
    refetch: () => Promise.all([summary.refetch(), shifts.refetch(), bookings.refetch(), workers.refetch(), pool.refetch(), employer.refetch()]),
  };
}
