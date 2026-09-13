import type { Booking, Employer, Shift } from "@/types";

/** A worker's booking joined to its shift and employer. */
export interface ScheduleItem {
  booking: Booking;
  shift: Shift;
  employer: Employer | undefined;
}

export interface DateGroup {
  /** yyyy-MM-dd */
  date: string;
  label: string;
  items: ScheduleItem[];
}

export type ScheduleSegment = "upcoming" | "pending" | "past";

export type DayMarker = "confirmed" | "pending";

export interface WorkerSchedule {
  /** The shift happening today, if any — drives the hero card. */
  today: ScheduleItem | undefined;
  upcoming: DateGroup[];
  pending: ScheduleItem[];
  past: ScheduleItem[];
  counts: Record<ScheduleSegment, number>;
  /** yyyy-MM-dd → strongest state that day, for the week strip. */
  dayMarkers: Record<string, DayMarker>;
}
