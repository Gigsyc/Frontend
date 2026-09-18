"use client";

import { useMemo } from "react";
import { useEmployerSummary } from "@/features/analytics";
import { useEmployerBookings } from "@/features/bookings";
import { useEmployer } from "@/features/employers";
import { useOrganizerEvents } from "@/features/events";
import { useEmployerInvoices } from "@/features/payments";
import { useEmployerShifts } from "@/features/shifts";
import type { Shift } from "@/types";
import { buildAttention, confirmedCount, shiftEndsAfter } from "./attention";
import { guestsThisMonth, liveEventCount, nextEvents, pickUpNext } from "./events";

export type { AttentionItem, AttentionKind } from "./attention";
export { confirmedCount } from "./attention";

export interface UpcomingShift {
  shift: Shift;
  confirmed: number;
}

const UPCOMING_SHIFTS_SHOWN = 4;

/** Everything the overview needs, from the hooks that already exist. */
export function useEmployerDashboard(employerId: string) {
  const employer = useEmployer(employerId);
  const events = useOrganizerEvents(employerId);
  const summary = useEmployerSummary(employerId);
  const shifts = useEmployerShifts(employerId);
  const bookings = useEmployerBookings(employerId);
  const invoices = useEmployerInvoices(employerId);

  const derived = useMemo(() => {
    if (!events.data || !shifts.data || !bookings.data || !invoices.data) return undefined;
    const now = new Date();
    const upcoming: UpcomingShift[] = shifts.data
      .filter((s) => ["open", "filled", "in_progress"].includes(s.status) && shiftEndsAfter(s, now))
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
      .map((shift) => ({ shift, confirmed: confirmedCount(bookings.data, shift.id) }));
    return {
      attention: buildAttention({ events: events.data, shifts: shifts.data, bookings: bookings.data, invoices: invoices.data, now }),
      upNext: pickUpNext(events.data, now),
      hasAnyEvent: events.data.length > 0,
      nextEvents: nextEvents(events.data, now),
      guests: guestsThisMonth(events.data, now),
      liveEvents: liveEventCount(events.data, now),
      upcoming: upcoming.slice(0, UPCOMING_SHIFTS_SHOWN),
      /** Same definition as `upcoming` (open, filled or in progress, not yet ended), so "Next 4 of N" adds up. */
      upcomingTotal: upcoming.length,
    };
  }, [events.data, shifts.data, bookings.data, invoices.data]);

  const queries = [employer, events, summary, shifts, bookings, invoices];

  return {
    employer: employer.data,
    summary: summary.data,
    ...derived,
    isPending: queries.some((q) => q.isPending),
    isError: queries.some((q) => q.isError),
    error: queries.find((q) => q.error)?.error ?? undefined,
    refetch: () => Promise.all(queries.map((q) => q.refetch())),
  };
}
