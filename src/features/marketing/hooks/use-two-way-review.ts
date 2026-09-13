import { useMemo } from "react";
import { useWorkerBookings } from "@/features/bookings";
import { useEmployers } from "@/features/employers";
import { useAllShifts } from "@/features/shifts";
import { useWorker } from "@/features/workers";
import type { Booking } from "@/types";

/**
 * Finds one completed booking for a worker where both sides left a rating,
 * joined to its shift and employer. Powers the "two-way accountability" card.
 */
export function useTwoWayReview(workerId: string) {
  const worker = useWorker(workerId);
  const bookings = useWorkerBookings(workerId);
  const shifts = useAllShifts();
  const employers = useEmployers();

  const review = useMemo(() => {
    if (!bookings.data || !shifts.data || !employers.data) return undefined;
    const completed = bookings.data.filter((b): b is Booking & { employerRating: NonNullable<Booking["employerRating"]> } => b.status === "completed" && !!b.employerRating);
    const booking =
      completed.find((b) => b.employerRating.note && b.workerRating?.note) ??
      completed.find((b) => b.employerRating.note) ??
      completed[0];
    if (!booking) return null;
    const shift = shifts.data.find((s) => s.id === booking.shiftId);
    const employer = shift ? employers.data.find((e) => e.id === shift.employerId) : undefined;
    if (!shift || !employer) return null;
    return { booking, shift, employer };
  }, [bookings.data, shifts.data, employers.data]);

  const all = [worker, bookings, shifts, employers];
  return {
    worker: worker.data,
    review,
    isPending: all.some((q) => q.isPending),
    isError: all.some((q) => q.isError),
    error: all.find((q) => q.error)?.error ?? null,
    isRefetching: all.some((q) => q.isRefetching),
    refetch: () => Promise.all(all.map((q) => q.refetch())),
  };
}
