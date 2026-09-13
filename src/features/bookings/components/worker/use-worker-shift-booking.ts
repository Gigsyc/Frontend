"use client";

import { useMemo } from "react";
import type { Booking, BookingStatus } from "@/types";
import { useWorkerBookings } from "../../queries";

const INACTIVE: BookingStatus[] = ["cancelled", "declined"];

/** The worker's live booking on one shift (if any) — derived from their bookings list so no extra store method is needed. */
export function useWorkerShiftBooking(workerId: string, shiftId: string | undefined) {
  const q = useWorkerBookings(workerId);
  const booking = useMemo<Booking | undefined>(() => {
    if (!q.data || !shiftId) return undefined;
    return q.data
      .filter((b) => b.shiftId === shiftId && !INACTIVE.includes(b.status))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }, [q.data, shiftId]);
  return { booking, isPending: q.isPending, isError: q.isError };
}

/** shiftId → status, for badges on cards. Only live bookings count. */
export function useBookingStatusByShift(workerId: string) {
  const q = useWorkerBookings(workerId);
  return useMemo(() => {
    const map = new Map<string, BookingStatus>();
    for (const b of q.data ?? []) {
      if (!INACTIVE.includes(b.status)) map.set(b.shiftId, b.status);
    }
    return map;
  }, [q.data]);
}
