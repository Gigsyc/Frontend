import { differenceInHours, parseISO, subDays, isAfter } from "date-fns";
import type { Booking, Invoice, Shift } from "@/types";

export interface EmployerSummary {
  upcomingShifts: number;
  openPositions: number;
  confirmedWorkers: number;
  fillRate: number; // %
  avgTimeToFillHours: number;
  attendanceRate: number; // %
  noShowRate: number; // %
  spendThisMonth: number;
  spendLastMonth: number;
  avgRatingGiven: number;
  pendingApplications: number;
  awaitingApproval: number;
  /** Last 8 weeks, oldest first */
  weeklySpend: Array<{ label: string; amount: number; shifts: number }>;
  roleMix: Array<{ role: Shift["role"]; shifts: number; workers: number }>;
  topWorkers: Array<{ workerId: string; shifts: number; avgRating: number }>;
}

export function computeEmployerSummary(shifts: Shift[], bookings: Booking[], invoices: Invoice[]): EmployerSummary {
  const now = new Date();
  const byShift = new Map<string, Booking[]>();
  for (const b of bookings) byShift.set(b.shiftId, [...(byShift.get(b.shiftId) ?? []), b]);

  const upcoming = shifts.filter((s) => ["open", "filled"].includes(s.status) && isAfter(parseISO(`${s.date}T${s.endTime}`), now));
  const confirmedFor = (s: Shift) => (byShift.get(s.id) ?? []).filter((b) => ["confirmed", "checked_in", "completed"].includes(b.status)).length;

  const openPositions = upcoming.reduce((a, s) => a + Math.max(0, s.workersNeeded - confirmedFor(s)), 0);
  const confirmedWorkers = upcoming.reduce((a, s) => a + confirmedFor(s), 0);

  const past = shifts.filter((s) => s.status === "completed");
  const pastNeeded = past.reduce((a, s) => a + s.workersNeeded, 0);
  const pastFilled = past.reduce((a, s) => a + (byShift.get(s.id) ?? []).filter((b) => ["completed", "no_show"].includes(b.status)).length, 0);
  const fillRate = pastNeeded ? Math.round((pastFilled / pastNeeded) * 100) : 0;

  const pastBookings = past.flatMap((s) => byShift.get(s.id) ?? []);
  const completed = pastBookings.filter((b) => b.status === "completed").length;
  const noShows = pastBookings.filter((b) => b.status === "no_show").length;
  const attendanceRate = completed + noShows ? Math.round((completed / (completed + noShows)) * 100) : 100;
  const noShowRate = completed + noShows ? Math.round((noShows / (completed + noShows)) * 1000) / 10 : 0;

  const ratings = pastBookings.map((b) => b.employerRating?.score).filter((x): x is number => typeof x === "number");
  const avgRatingGiven = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0;

  const timeToFill = past
    .map((s) => {
      const confirmed = (byShift.get(s.id) ?? []).filter((b) => b.status !== "applied" && b.status !== "invited");
      if (!confirmed.length) return null;
      const last = confirmed.map((b) => parseISO(b.createdAt)).sort((a, b) => b.getTime() - a.getTime())[0];
      return Math.max(1, differenceInHours(last, parseISO(s.createdAt)));
    })
    .filter((x): x is number => x !== null);
  const avgTimeToFillHours = timeToFill.length ? Math.round(timeToFill.reduce((a, b) => a + b, 0) / timeToFill.length) : 0;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const spend = (from: Date, to: Date) =>
    past.filter((s) => { const d = parseISO(s.date); return d >= from && d < to; })
      .reduce((a, s) => a + (byShift.get(s.id) ?? []).filter((b) => b.status === "completed").length * s.payPerShift, 0);
  const spendThisMonth = spend(monthStart, new Date(now.getFullYear(), now.getMonth() + 1, 1));
  const spendLastMonth = spend(lastMonthStart, monthStart);

  const weeklySpend = Array.from({ length: 8 }, (_, i) => {
    const end = subDays(now, (7 - i) * 7);
    const start = subDays(end, 7);
    const inWeek = past.filter((s) => { const d = parseISO(s.date); return d >= start && d < end; });
    const amount = inWeek.reduce((a, s) => a + (byShift.get(s.id) ?? []).filter((b) => b.status === "completed").length * s.payPerShift, 0);
    return { label: `W${i + 1}`, amount, shifts: inWeek.length };
  });

  const roleMap = new Map<Shift["role"], { shifts: number; workers: number }>();
  for (const s of shifts) {
    const e = roleMap.get(s.role) ?? { shifts: 0, workers: 0 };
    e.shifts += 1; e.workers += confirmedFor(s);
    roleMap.set(s.role, e);
  }
  const roleMix = [...roleMap.entries()].map(([role, v]) => ({ role, ...v })).sort((a, b) => b.workers - a.workers);

  const workerMap = new Map<string, { shifts: number; ratings: number[] }>();
  for (const b of pastBookings.filter((b) => b.status === "completed")) {
    const e = workerMap.get(b.workerId) ?? { shifts: 0, ratings: [] };
    e.shifts += 1; if (b.employerRating) e.ratings.push(b.employerRating.score);
    workerMap.set(b.workerId, e);
  }
  const topWorkers = [...workerMap.entries()]
    .map(([workerId, v]) => ({ workerId, shifts: v.shifts, avgRating: v.ratings.length ? v.ratings.reduce((a, b) => a + b, 0) / v.ratings.length : 0 }))
    .sort((a, b) => b.avgRating - a.avgRating || b.shifts - a.shifts)
    .slice(0, 5);

  return {
    upcomingShifts: upcoming.length,
    openPositions,
    confirmedWorkers,
    fillRate,
    avgTimeToFillHours,
    attendanceRate,
    noShowRate,
    spendThisMonth,
    spendLastMonth,
    avgRatingGiven,
    pendingApplications: bookings.filter((b) => b.status === "applied").length,
    awaitingApproval: bookings.filter((b) => b.status === "completed" && !b.approvedAt).length,
    weeklySpend,
    roleMix,
    topWorkers,
  };
  void invoices;
}

export interface WorkerEarningsSummary {
  paidThisMonth: number;
  pending: number;
  lifetime: number;
  shiftsThisMonth: number;
  hoursThisMonth: number;
  /** last 6 months oldest → newest */
  monthly: Array<{ label: string; amount: number }>;
}
