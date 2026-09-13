import { isBefore, parseISO } from "date-fns";
import type { Booking, Shift, ShiftStatus } from "@/types";

export interface BookingCounts {
  applied: number;
  invited: number;
  confirmed: number;
  checkedIn: number;
  completed: number;
  noShow: number;
  /** Seats taken: confirmed + checked in + completed. */
  filled: number;
}

export function countBookings(bookings: Booking[] = []): BookingCounts {
  const c: BookingCounts = { applied: 0, invited: 0, confirmed: 0, checkedIn: 0, completed: 0, noShow: 0, filled: 0 };
  for (const b of bookings) {
    switch (b.status) {
      case "applied": c.applied += 1; break;
      case "invited": c.invited += 1; break;
      case "confirmed": c.confirmed += 1; c.filled += 1; break;
      case "checked_in": c.checkedIn += 1; c.filled += 1; break;
      case "completed": c.completed += 1; c.filled += 1; break;
      case "no_show": c.noShow += 1; break;
      default: break;
    }
  }
  return c;
}

export const EMPTY_COUNTS: BookingCounts = countBookings([]);

/** True once the shift's start time has passed. */
export function hasShiftStarted(shift: Pick<Shift, "date" | "startTime">, now = new Date()) {
  return !isBefore(now, parseISO(`${shift.date}T${shift.startTime}`));
}

/** Shifts the employer can still call off. In-progress shifts have people on site. */
export const CANCELLABLE: ReadonlySet<ShiftStatus> = new Set<ShiftStatus>(["draft", "open", "filled"]);

/** Shifts that can still take workers. */
export const STAFFABLE: ReadonlySet<ShiftStatus> = new Set<ShiftStatus>(["open", "filled", "in_progress"]);

export const CHECK_IN_LABEL: Record<Shift["checkInMethod"], string> = {
  qr: "QR code at the venue",
  supervisor: "Supervisor confirms",
  gps: "GPS from the worker's phone",
};

/** Re-exported from @/lib/utils so existing imports keep working. */
export { isNotFoundError as isNotFound, errorMessage } from "@/lib/utils";
