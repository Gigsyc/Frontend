import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import type { Booking } from "@/types";
import { bookingsApi } from "./api";

/** Bookings for one shift. Pass `refetchInterval` to poll (e.g. a live attendance view). */
export const useShiftBookings = (shiftId: string | undefined, options: { refetchInterval?: number; enabled?: boolean } = {}) =>
  useQuery({
    queryKey: qk.bookings.byShift(shiftId ?? ""),
    queryFn: () => bookingsApi.listForShift(shiftId!),
    enabled: !!shiftId && (options.enabled ?? true),
    refetchInterval: options.refetchInterval,
  });

export const useWorkerBookings = (workerId: string) =>
  useQuery({ queryKey: qk.bookings.byWorker(workerId), queryFn: () => bookingsApi.listForWorker(workerId) });

export const useEmployerBookings = (employerId: string) =>
  useQuery({ queryKey: qk.bookings.byEmployer(employerId), queryFn: () => bookingsApi.listForEmployer(employerId) });

/** Any booking change can affect shift status, worker stats, payouts and notifications. */
function invalidateBookingGraph(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: qk.bookings.all });
  qc.invalidateQueries({ queryKey: qk.shifts.all });
  qc.invalidateQueries({ queryKey: qk.workers.all });
  qc.invalidateQueries({ queryKey: qk.notifications.all });
  qc.invalidateQueries({ queryKey: ["payouts"] });
}

function useBookingMutation<TVars, TData = Booking>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation<TData, Error, TVars>({ mutationFn: fn, onSuccess: () => invalidateBookingGraph(qc) });
}

export const useApplyToShift = () => useBookingMutation((v: { shiftId: string; workerId: string }) => bookingsApi.apply(v.shiftId, v.workerId));
export const useRespondToInvite = () => useBookingMutation((v: { bookingId: string; accept: boolean }) => bookingsApi.respondToInvite(v.bookingId, v.accept));
export const useWithdrawBooking = () => useBookingMutation((bookingId: string) => bookingsApi.withdraw(bookingId));
export const useConfirmBooking = () => useBookingMutation((bookingId: string) => bookingsApi.confirm(bookingId));
export const useDeclineBooking = () => useBookingMutation((bookingId: string) => bookingsApi.decline(bookingId));
export const useInviteWorker = () => useBookingMutation((v: { shiftId: string; workerId: string }) => bookingsApi.invite(v.shiftId, v.workerId));
export const useCheckIn = () => useBookingMutation((bookingId: string) => bookingsApi.checkIn(bookingId));
export const useCheckOut = () => useBookingMutation((bookingId: string) => bookingsApi.checkOut(bookingId));
export const useMarkNoShow = () => useBookingMutation((bookingId: string) => bookingsApi.markNoShow(bookingId));
export const useApproveBooking = () =>
  useBookingMutation((v: { bookingId: string; rating: NonNullable<Booking["employerRating"]> }) => bookingsApi.approve(v.bookingId, v.rating));
export const useRateEmployer = () =>
  useBookingMutation((v: { bookingId: string; rating: NonNullable<Booking["workerRating"]> }) => bookingsApi.rateEmployer(v.bookingId, v.rating));
