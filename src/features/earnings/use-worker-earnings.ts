import { useCallback, useMemo } from "react";
import { format, startOfMonth, subMonths } from "date-fns";
import { useWorkerBookings } from "@/features/bookings";
import { useEmployers } from "@/features/employers";
import { useWorkerPayouts } from "@/features/payments";
import { useAllShifts } from "@/features/shifts";
import type { Payout } from "@/types";
import type { MonthPoint, PayoutItem, WorkerEarnings } from "./types";

const MONTHS_SHOWN = 6;

/** The date a payout counts towards: when it was paid, otherwise when it's due. */
export const payoutDate = (p: Payout) => p.paidAt ?? p.scheduledFor;

const sum = (items: PayoutItem[]) => items.reduce((acc, it) => acc + it.payout.amount, 0);

function monthlySeries(paid: PayoutItem[], now: Date): MonthPoint[] {
  const start = startOfMonth(now);
  return Array.from({ length: MONTHS_SHOWN }, (_, i) => {
    const month = subMonths(start, MONTHS_SHOWN - 1 - i);
    const key = format(month, "yyyy-MM");
    // Months before the data begins are genuinely zero for this account; we don't invent history.
    const total = paid.filter((it) => payoutDate(it.payout).startsWith(key)).reduce((a, it) => a + it.payout.amount, 0);
    return { key, label: format(month, "MMM"), hint: format(month, "MMMM yyyy"), paid: total };
  });
}

function buildEarnings(items: PayoutItem[], now = new Date()): WorkerEarnings {
  const waiting = items
    .filter((it) => it.payout.status !== "paid")
    .sort((a, b) => a.payout.scheduledFor.localeCompare(b.payout.scheduledFor));
  const paid = items
    .filter((it) => it.payout.status === "paid")
    .sort((a, b) => payoutDate(b.payout).localeCompare(payoutDate(a.payout)));
  const monthKey = format(now, "yyyy-MM");

  return {
    paidThisMonth: sum(paid.filter((it) => payoutDate(it.payout).startsWith(monthKey))),
    pending: sum(waiting),
    pendingCount: waiting.length,
    lifetime: sum(paid),
    paidCount: paid.length,
    months: monthlySeries(paid, now),
    waiting,
    paid,
  };
}

/**
 * Everything the earnings screen needs, derived from the worker's payouts joined to shifts,
 * employers and bookings. Composes existing hooks; no new store methods.
 */
export function useWorkerEarnings(workerId: string) {
  const payouts = useWorkerPayouts(workerId);
  const shifts = useAllShifts();
  const employers = useEmployers();
  const bookings = useWorkerBookings(workerId);

  const data = useMemo<WorkerEarnings | undefined>(() => {
    if (!payouts.data || !shifts.data || !employers.data || !bookings.data) return undefined;
    const shiftById = new Map(shifts.data.map((s) => [s.id, s]));
    const employerById = new Map(employers.data.map((e) => [e.id, e]));
    const bookingById = new Map(bookings.data.map((b) => [b.id, b]));
    const items: PayoutItem[] = [];
    for (const payout of payouts.data) {
      const shift = shiftById.get(payout.shiftId);
      if (!shift) continue;
      items.push({ payout, shift, employer: employerById.get(shift.employerId), booking: bookingById.get(payout.bookingId) });
    }
    return buildEarnings(items);
  }, [payouts.data, shifts.data, employers.data, bookings.data]);

  const refetch = useCallback(() => {
    void payouts.refetch();
    void shifts.refetch();
    void employers.refetch();
    void bookings.refetch();
  }, [payouts, shifts, employers, bookings]);

  return {
    data,
    isPending: payouts.isPending || shifts.isPending || employers.isPending || bookings.isPending,
    isError: payouts.isError || shifts.isError || employers.isError || bookings.isError,
    error: payouts.error ?? shifts.error ?? employers.error ?? bookings.error,
    isRefetching: payouts.isRefetching || shifts.isRefetching || employers.isRefetching || bookings.isRefetching,
    refetch,
  };
}
