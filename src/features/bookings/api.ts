import { store } from "@/lib/mock/store";
import type { Booking } from "@/types";

export const bookingsApi = {
  listForShift: (shiftId: string) => store.listBookingsForShift(shiftId),
  listForWorker: (workerId: string) => store.listBookingsForWorker(workerId),
  listForEmployer: (employerId: string) => store.listBookingsForEmployer(employerId),
  apply: (shiftId: string, workerId: string) => store.applyToShift(shiftId, workerId),
  respondToInvite: (bookingId: string, accept: boolean) => store.respondToInvite(bookingId, accept),
  withdraw: (bookingId: string) => store.withdrawBooking(bookingId),
  confirm: (bookingId: string) => store.confirmBooking(bookingId),
  decline: (bookingId: string) => store.declineBooking(bookingId),
  invite: (shiftId: string, workerId: string) => store.inviteWorker(shiftId, workerId),
  checkIn: (bookingId: string) => store.checkIn(bookingId),
  checkOut: (bookingId: string) => store.checkOut(bookingId),
  markNoShow: (bookingId: string) => store.markNoShow(bookingId),
  approve: (bookingId: string, rating: NonNullable<Booking["employerRating"]>) => store.approveBooking(bookingId, rating),
  rateEmployer: (bookingId: string, rating: NonNullable<Booking["workerRating"]>) => store.rateEmployer(bookingId, rating),
};
