"use client";

import { useMemo } from "react";
import { differenceInCalendarDays, isAfter, parseISO } from "date-fns";
import { useEmployerSummary } from "@/features/analytics";
import { useEmployerBookings } from "@/features/bookings";
import { useEmployerInvoices } from "@/features/payments";
import { useEmployerShifts } from "@/features/shifts";
import { formatRelativeDay, formatRwf, pluralize } from "@/lib/utils";
import type { Booking, Invoice, Shift } from "@/types";

export type AttentionKind = "applications" | "attendance" | "staffing" | "review" | "invoice";

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  title: string;
  description: string;
  href: string;
  urgent?: boolean;
}

export interface UpcomingShift {
  shift: Shift;
  confirmed: number;
}

const COUNTS_AS_FILLED: Booking["status"][] = ["confirmed", "checked_in", "completed"];

export function confirmedCount(bookings: Booking[], shiftId: string) {
  return bookings.filter((b) => b.shiftId === shiftId && COUNTS_AS_FILLED.includes(b.status)).length;
}

const endsAfter = (s: Shift, now: Date) => isAfter(parseISO(`${s.date}T${s.endTime}`), now);

function buildAttention(shifts: Shift[], bookings: Booking[], invoices: Invoice[], now: Date): AttentionItem[] {
  const items: AttentionItem[] = [];

  const applied = bookings.filter((b) => b.status === "applied");
  if (applied.length) {
    const shiftIds = new Set(applied.map((b) => b.shiftId));
    items.push({
      id: "applications",
      kind: "applications",
      title: `${pluralize(applied.length, "application")} to review`,
      description: `Across ${pluralize(shiftIds.size, "shift")} · applicants are waiting on a decision`,
      href: "/employer/jobs?filter=applications",
    });
  }

  for (const s of shifts.filter((x) => x.status === "in_progress")) {
    const forShift = bookings.filter((b) => b.shiftId === s.id);
    const expected = forShift.filter((b) => COUNTS_AS_FILLED.includes(b.status)).length;
    const checkedIn = forShift.filter((b) => b.status === "checked_in" || b.status === "completed").length;
    items.push({
      id: `attendance-${s.id}`,
      kind: "attendance",
      title: `${s.title} is under way`,
      description: `${checkedIn} of ${expected} checked in · started ${s.startTime}`,
      href: `/employer/jobs/${s.id}?tab=attendance`,
      urgent: checkedIn < expected,
    });
  }

  const short = shifts
    .filter((s) => s.status === "open" && endsAfter(s, now))
    .map((s) => ({ s, gap: s.workersNeeded - confirmedCount(bookings, s.id), days: differenceInCalendarDays(parseISO(s.date), now) }))
    .filter(({ s, gap, days }) => gap > 0 && (s.urgent || days <= 2))
    .sort((a, b) => a.days - b.days);
  for (const { s, gap } of short) {
    items.push({
      id: `staffing-${s.id}`,
      kind: "staffing",
      title: `${s.title} is short-staffed`,
      description: `${pluralize(gap, "more worker")} needed · ${formatRelativeDay(s.date)} ${s.startTime}`,
      href: `/employer/jobs/${s.id}?tab=staffing`,
      urgent: true,
    });
  }

  // One card per shift, like staffing: each links straight to that shift's Review & approve tab.
  const awaiting = bookings.filter((b) => b.status === "completed" && !b.approvedAt);
  const awaitingByShift = new Map<string, number>();
  for (const b of awaiting) awaitingByShift.set(b.shiftId, (awaitingByShift.get(b.shiftId) ?? 0) + 1);
  const toReview = shifts
    .filter((s) => awaitingByShift.has(s.id))
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
  for (const s of toReview) {
    const waiting = awaitingByShift.get(s.id) ?? 0;
    items.push({
      id: `review-${s.id}`,
      kind: "review",
      title: `${s.title} is ready to approve`,
      description: `${pluralize(waiting, "worker")} waiting for a rating before payout · ${formatRelativeDay(s.date)}`,
      href: `/employer/jobs/${s.id}?tab=review`,
    });
  }

  for (const inv of invoices.filter((i) => i.status === "due" || i.status === "overdue")) {
    const days = differenceInCalendarDays(parseISO(inv.dueAt), now);
    items.push({
      id: `invoice-${inv.id}`,
      kind: "invoice",
      title: inv.status === "overdue" || days < 0 ? `Invoice ${inv.number} is overdue` : `Invoice ${inv.number} due ${days === 0 ? "today" : `in ${pluralize(days, "day")}`}`,
      description: `${formatRwf(inv.total)} · ${pluralize(inv.lines.length, "shift")} this period`,
      href: `/employer/payments/${inv.id}`,
      urgent: days <= 3,
    });
  }

  return items;
}

/** Everything the overview needs, from the hooks that already exist. */
export function useEmployerDashboard(employerId: string) {
  const summary = useEmployerSummary(employerId);
  const shifts = useEmployerShifts(employerId);
  const bookings = useEmployerBookings(employerId);
  const invoices = useEmployerInvoices(employerId);

  const derived = useMemo(() => {
    if (!shifts.data || !bookings.data || !invoices.data) return undefined;
    const now = new Date();
    const live = shifts.data.filter((s) => ["open", "filled", "in_progress"].includes(s.status) && endsAfter(s, now));
    const upcoming: UpcomingShift[] = live
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
      .map((shift) => ({ shift, confirmed: confirmedCount(bookings.data, shift.id) }));
    const thisWeek = upcoming.filter(({ shift }) => differenceInCalendarDays(parseISO(shift.date), now) < 7);
    return {
      attention: buildAttention(shifts.data, bookings.data, invoices.data, now),
      upcoming: upcoming.slice(0, 5),
      /** Same definition as `upcoming` (open, filled or in progress, not yet ended), so "Next 5 of N" adds up. */
      upcomingTotal: upcoming.length,
      shiftsThisWeek: thisWeek.length,
      confirmedThisWeek: thisWeek.reduce((a, u) => a + u.confirmed, 0),
    };
  }, [shifts.data, bookings.data, invoices.data]);

  return {
    summary: summary.data,
    ...derived,
    isPending: summary.isPending || shifts.isPending || bookings.isPending || invoices.isPending,
    isError: summary.isError || shifts.isError || bookings.isError || invoices.isError,
    error: summary.error ?? shifts.error ?? bookings.error ?? invoices.error,
    refetch: () => Promise.all([summary.refetch(), shifts.refetch(), bookings.refetch(), invoices.refetch()]),
  };
}
