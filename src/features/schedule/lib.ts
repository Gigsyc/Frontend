import { differenceInMinutes, format, isBefore, parseISO, startOfToday, subMinutes } from "date-fns";
import type { Shift } from "@/types";

type ShiftTime = Pick<Shift, "date" | "startTime">;

/** Local Date for the shift's start. */
export function shiftStart(shift: ShiftTime) {
  return parseISO(`${shift.date}T${shift.startTime}:00`);
}

/** Signed hours from now until the shift starts (negative once it has started). */
export function hoursUntilStart(shift: ShiftTime, now = new Date()) {
  return differenceInMinutes(shiftStart(shift), now) / 60;
}

export function isPastDay(date: string) {
  return isBefore(parseISO(date), startOfToday());
}

/** "09:02" from an ISO timestamp. */
export function formatClock(iso: string) {
  return format(parseISO(iso), "HH:mm");
}

/** Check-in opens 15 minutes before the scheduled start. */
export function checkInOpensAt(shift: ShiftTime) {
  return format(subMinutes(shiftStart(shift), 15), "HH:mm");
}

/** "Ikaze" from "Ikaze Hospitality Group" — how people actually refer to employers. */
export function employerShortName(name: string | undefined) {
  return name?.split(" ")[0] ?? "the employer";
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

