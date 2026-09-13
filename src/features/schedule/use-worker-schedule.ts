import { useCallback, useMemo } from "react";
import { isToday } from "date-fns";
import { useWorkerBookings } from "@/features/bookings";
import { useEmployers } from "@/features/employers";
import { useAllShifts } from "@/features/shifts";
import { formatRelativeDay } from "@/lib/utils";
import type { BookingStatus } from "@/types";
import { isPastDay, shiftStart } from "./lib";
import type { DateGroup, DayMarker, ScheduleItem, WorkerSchedule } from "./types";

const ACTIVE: BookingStatus[] = ["confirmed", "checked_in"];
const PENDING: BookingStatus[] = ["applied", "invited"];
const TODAY_PRIORITY: Partial<Record<BookingStatus, number>> = { checked_in: 0, confirmed: 1, completed: 2 };

const byStartAsc = (a: ScheduleItem, b: ScheduleItem) => shiftStart(a.shift).getTime() - shiftStart(b.shift).getTime();

function groupByDate(items: ScheduleItem[]): DateGroup[] {
  const groups = new Map<string, ScheduleItem[]>();
  for (const it of items) {
    const list = groups.get(it.shift.date) ?? [];
    list.push(it);
    groups.set(it.shift.date, list);
  }
  return Array.from(groups, ([date, list]) => ({ date, label: formatRelativeDay(date), items: list }));
}

function pickToday(items: ScheduleItem[]): ScheduleItem | undefined {
  return items
    .filter((it) => isToday(shiftStart(it.shift)) && TODAY_PRIORITY[it.booking.status] !== undefined)
    .sort((a, b) => (TODAY_PRIORITY[a.booking.status] ?? 9) - (TODAY_PRIORITY[b.booking.status] ?? 9) || byStartAsc(a, b))[0];
}

function buildSchedule(items: ScheduleItem[]): WorkerSchedule {
  const today = pickToday(items);
  const rest = today ? items.filter((it) => it.booking.id !== today.booking.id) : items;

  const upcomingItems = rest.filter((it) => ACTIVE.includes(it.booking.status) && !isPastDay(it.shift.date)).sort(byStartAsc);
  const pending = rest.filter((it) => PENDING.includes(it.booking.status)).sort(byStartAsc);
  const past = rest
    .filter((it) => !PENDING.includes(it.booking.status) && !(ACTIVE.includes(it.booking.status) && !isPastDay(it.shift.date)))
    .sort((a, b) => byStartAsc(b, a));

  const dayMarkers: Record<string, DayMarker> = {};
  for (const it of pending) dayMarkers[it.shift.date] = "pending";
  for (const it of upcomingItems) dayMarkers[it.shift.date] = "confirmed";
  if (today) dayMarkers[today.shift.date] = "confirmed";

  return {
    today,
    upcoming: groupByDate(upcomingItems),
    pending,
    past,
    counts: { upcoming: upcomingItems.length, pending: pending.length, past: past.length },
    dayMarkers,
  };
}

/**
 * Joins the worker's bookings to shifts and employers and buckets them the way the
 * schedule screen needs them. Composes existing hooks; no new store methods.
 */
export function useWorkerSchedule(workerId: string) {
  const bookings = useWorkerBookings(workerId);
  const shifts = useAllShifts();
  const employers = useEmployers();

  const data = useMemo<WorkerSchedule | undefined>(() => {
    if (!bookings.data || !shifts.data || !employers.data) return undefined;
    const shiftById = new Map(shifts.data.map((s) => [s.id, s]));
    const employerById = new Map(employers.data.map((e) => [e.id, e]));
    const items: ScheduleItem[] = [];
    for (const booking of bookings.data) {
      const shift = shiftById.get(booking.shiftId);
      if (!shift) continue;
      items.push({ booking, shift, employer: employerById.get(shift.employerId) });
    }
    return buildSchedule(items);
  }, [bookings.data, shifts.data, employers.data]);

  const refetch = useCallback(() => {
    void bookings.refetch();
    void shifts.refetch();
    void employers.refetch();
  }, [bookings, shifts, employers]);

  return {
    data,
    isPending: bookings.isPending || shifts.isPending || employers.isPending,
    isError: bookings.isError || shifts.isError || employers.isError,
    error: bookings.error ?? shifts.error ?? employers.error,
    isRefetching: bookings.isRefetching || shifts.isRefetching || employers.isRefetching,
    refetch,
  };
}
