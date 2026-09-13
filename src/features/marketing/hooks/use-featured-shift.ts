import { useMemo } from "react";
import { useShiftBookings } from "@/features/bookings";
import { useEmployer } from "@/features/employers";
import { useEmployerSession } from "@/features/session";
import { useOpenShifts } from "@/features/shifts";
import type { Shift } from "@/types";

/** Prefer the demo employer's biggest open job; otherwise the biggest open job on the marketplace. */
function pickFeatured(shifts: Shift[] | undefined, preferredEmployerId: string): Shift | undefined {
  if (!shifts?.length) return undefined;
  const size = (s: Shift) => s.workersNeeded * s.payPerShift;
  const largest = (list: Shift[]) => list.reduce<Shift | undefined>((best, s) => (!best || size(s) > size(best) ? s : best), undefined);
  return largest(shifts.filter((s) => s.employerId === preferredEmployerId)) ?? largest(shifts);
}

/** One live open shift with its fill count and employer — for the home hero card. */
export function useFeaturedShift() {
  const { employerId } = useEmployerSession();
  const shifts = useOpenShifts({ sort: "soonest" });
  const shift = useMemo(() => pickFeatured(shifts.data, employerId), [shifts.data, employerId]);
  const bookings = useShiftBookings(shift?.id);
  const employer = useEmployer(shift?.employerId);

  const confirmed = bookings.data?.filter((b) => b.status === "confirmed" || b.status === "checked_in").length ?? 0;
  const isEmpty = shifts.isSuccess && !shift;

  return {
    shift,
    employer: employer.data,
    confirmed,
    isEmpty,
    isPending: shifts.isPending || (!!shift && (bookings.isPending || employer.isPending)),
    isError: shifts.isError || bookings.isError || employer.isError,
    error: shifts.error ?? bookings.error ?? employer.error,
    isRefetching: shifts.isRefetching || bookings.isRefetching || employer.isRefetching,
    refetch: () => Promise.all([shifts.refetch(), bookings.refetch(), employer.refetch()]),
  };
}
