import { useMemo } from "react";
import { useEmployerBookings } from "@/features/bookings";
import { useEmployerInvoices } from "@/features/payments";
import { useEmployerShifts } from "@/features/shifts";
import { computeEmployerSummary } from "./compute";

/** Composes the three underlying queries; consumers get one loading/error surface. */
export function useEmployerSummary(employerId: string) {
  const shifts = useEmployerShifts(employerId);
  const bookings = useEmployerBookings(employerId);
  const invoices = useEmployerInvoices(employerId);
  const data = useMemo(
    () => (shifts.data && bookings.data && invoices.data ? computeEmployerSummary(shifts.data, bookings.data, invoices.data) : undefined),
    [shifts.data, bookings.data, invoices.data],
  );
  return {
    data,
    isPending: shifts.isPending || bookings.isPending || invoices.isPending,
    isError: shifts.isError || bookings.isError || invoices.isError,
    error: shifts.error ?? bookings.error ?? invoices.error,
    refetch: () => Promise.all([shifts.refetch(), bookings.refetch(), invoices.refetch()]),
  };
}
