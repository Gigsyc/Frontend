import { useMemo } from "react";
import { useEmployerBookings } from "@/features/bookings";
import { useEmployerSession } from "@/features/session";
import { useEmployerShifts } from "@/features/shifts";
import type { Shift } from "@/types";

const ACTIVE: Shift["status"][] = ["open", "filled", "in_progress"];

/**
 * Real data for the business-page product tour: the demo employer's active jobs
 * with confirmed counts, the biggest open job (for matching) and the live shift
 * (for attendance). Read-only — nothing here mutates.
 */
export function useEmployerTour() {
  const { employerId } = useEmployerSession();
  const shifts = useEmployerShifts(employerId);
  const bookings = useEmployerBookings(employerId);

  const derived = useMemo(() => {
    if (!shifts.data || !bookings.data) return undefined;
    const confirmedByShift = new Map<string, number>();
    for (const b of bookings.data) {
      if (b.status === "confirmed" || b.status === "checked_in" || b.status === "completed") {
        confirmedByShift.set(b.shiftId, (confirmedByShift.get(b.shiftId) ?? 0) + 1);
      }
    }
    const active = shifts.data
      .filter((s) => ACTIVE.includes(s.status))
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    const open = active.filter((s) => s.status === "open");
    const featured = open.reduce<Shift | undefined>((best, s) => (!best || s.workersNeeded * s.payPerShift > best.workersNeeded * best.payPerShift ? s : best), undefined);
    const live = active.find((s) => s.status === "in_progress") ?? active.find((s) => s.status === "filled");
    return { active, confirmedByShift, featured, live };
  }, [shifts.data, bookings.data]);

  return {
    employerId,
    active: derived?.active,
    confirmedByShift: derived?.confirmedByShift,
    featured: derived?.featured,
    live: derived?.live,
    isPending: shifts.isPending || bookings.isPending,
    isError: shifts.isError || bookings.isError,
    error: shifts.error ?? bookings.error,
    isRefetching: shifts.isRefetching || bookings.isRefetching,
    refetch: () => Promise.all([shifts.refetch(), bookings.refetch()]),
  };
}
