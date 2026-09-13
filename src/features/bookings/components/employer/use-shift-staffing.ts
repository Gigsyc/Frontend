"use client";

import { useMemo } from "react";
import { useShiftBookings } from "@/features/bookings";
import { useWorkers } from "@/features/workers";
import type { Booking, BookingStatus, Worker } from "@/types";

export interface StaffingRow {
  booking: Booking;
  worker: Worker;
}

/** Statuses that hold a seat on the shift. */
export const SEATED: ReadonlySet<BookingStatus> = new Set<BookingStatus>(["confirmed", "checked_in", "completed"]);
/** Statuses that mean the worker is still attached to the shift in some way. */
export const ACTIVE: ReadonlySet<BookingStatus> = new Set<BookingStatus>(["invited", "applied", "confirmed", "checked_in", "completed", "no_show"]);

/**
 * Bookings for a shift joined to their workers, composed from the two existing queries.
 * Bookings whose worker can't be found (shouldn't happen) are dropped rather than crashing a row.
 */
export function useShiftStaffing(shiftId: string) {
  const bookingsQ = useShiftBookings(shiftId);
  const workersQ = useWorkers({});

  const workersById = useMemo(() => new Map((workersQ.data ?? []).map((w) => [w.id, w])), [workersQ.data]);

  const rows = useMemo<StaffingRow[]>(() => {
    const out: StaffingRow[] = [];
    for (const booking of bookingsQ.data ?? []) {
      const worker = workersById.get(booking.workerId);
      if (worker) out.push({ booking, worker });
    }
    return out.sort((a, b) => a.booking.createdAt.localeCompare(b.booking.createdAt));
  }, [bookingsQ.data, workersById]);

  const byStatus = (statuses: BookingStatus[]) => rows.filter((r) => statuses.includes(r.booking.status));

  const filled = rows.filter((r) => SEATED.has(r.booking.status)).length;
  const counts = {
    filled,
    confirmed: byStatus(["confirmed"]).length,
    checkedIn: byStatus(["checked_in"]).length,
    completed: byStatus(["completed"]).length,
    applied: byStatus(["applied"]).length,
    invited: byStatus(["invited"]).length,
    noShow: byStatus(["no_show"]).length,
    pendingApproval: rows.filter((r) => r.booking.status === "completed" && !r.booking.approvedAt).length,
  };
  /** Worker ids already attached, so suggestions don't repeat people who are on the shift. */
  const attachedWorkerIds = useMemo(() => new Set(rows.filter((r) => ACTIVE.has(r.booking.status)).map((r) => r.worker.id)), [rows]);

  return {
    rows,
    byStatus,
    counts,
    attachedWorkerIds,
    isPending: bookingsQ.isPending || workersQ.isPending,
    isError: bookingsQ.isError || workersQ.isError,
    error: bookingsQ.error ?? workersQ.error,
    isRefetching: bookingsQ.isRefetching || workersQ.isRefetching,
    refetch: () => Promise.all([bookingsQ.refetch(), workersQ.refetch()]),
  };
}
