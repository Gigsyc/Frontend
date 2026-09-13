"use client";

import { useMemo } from "react";
import { useEmployerBookings } from "@/features/bookings";
import { useEmployerShifts } from "@/features/shifts";
import type { Booking } from "@/types";
import { countBookings, type BookingCounts } from "./shift-helpers";

/** Shifts for the employer plus per-shift booking counts, composed from the two existing queries. */
export function useEmployerJobs(employerId: string) {
  const shifts = useEmployerShifts(employerId);
  const bookings = useEmployerBookings(employerId);

  const countsByShift = useMemo(() => {
    const grouped = new Map<string, Booking[]>();
    for (const b of bookings.data ?? []) {
      const list = grouped.get(b.shiftId);
      if (list) list.push(b);
      else grouped.set(b.shiftId, [b]);
    }
    const out: Record<string, BookingCounts> = {};
    grouped.forEach((list, shiftId) => { out[shiftId] = countBookings(list); });
    return out;
  }, [bookings.data]);

  return {
    shifts: shifts.data,
    countsByShift,
    isPending: shifts.isPending || bookings.isPending,
    isError: shifts.isError || bookings.isError,
    error: shifts.error ?? bookings.error,
    isRefetching: shifts.isRefetching || bookings.isRefetching,
    refetch: () => Promise.all([shifts.refetch(), bookings.refetch()]),
  };
}
