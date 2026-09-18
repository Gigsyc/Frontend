import { differenceInCalendarDays, isAfter, parseISO } from "date-fns";
import { formatRelativeDay, formatRwf, formatTimeAgo, pluralize } from "@/lib/utils";
import type { Booking, Event, Invoice, Shift } from "@/types";
import { firstLineOf } from "./events";

export type AttentionKind = "event_changes" | "event_review" | "applications" | "attendance" | "staffing" | "review" | "invoice";

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  title: string;
  description: string;
  href: string;
  urgent?: boolean;
}

const COUNTS_AS_FILLED: Booking["status"][] = ["confirmed", "checked_in", "completed"];

export function confirmedCount(bookings: Booking[], shiftId: string) {
  return bookings.filter((b) => b.shiftId === shiftId && COUNTS_AS_FILLED.includes(b.status)).length;
}

export const shiftEndsAfter = (s: Shift, now: Date) => isAfter(parseISO(`${s.date}T${s.endTime}`), now);

/** Events first — a listing that needs changes is the most expensive thing to leave sitting. */
function eventItems(events: Event[]): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const e of events.filter((x) => x.status === "rejected")) {
    items.push({
      id: `event-changes-${e.id}`,
      kind: "event_changes",
      title: `${e.title} needs changes`,
      description: firstLineOf(e.reviewNote) ?? "GigSyc left a note on the listing. Update it and it goes straight back for review.",
      href: `/employer/events/${e.id}`,
      urgent: true,
    });
  }
  for (const e of events.filter((x) => x.status === "pending_review")) {
    items.push({
      id: `event-review-${e.id}`,
      kind: "event_review",
      title: `${e.title} is with GigSyc`,
      description: `${e.submittedAt ? `Submitted ${formatTimeAgo(e.submittedAt)}` : "Submitted"} · you'll hear back before it goes live`,
      href: `/employer/events/${e.id}`,
    });
  }
  return items;
}

function shiftItems(shifts: Shift[], bookings: Booking[], now: Date): AttentionItem[] {
  const items: AttentionItem[] = [];

  const applied = bookings.filter((b) => b.status === "applied");
  if (applied.length) {
    const shiftIds = new Set(applied.map((b) => b.shiftId));
    items.push({
      id: "applications",
      kind: "applications",
      title: `${pluralize(applied.length, "application")} to review`,
      description: `Across ${pluralize(shiftIds.size, "shift")} · applicants are waiting on a decision`,
      href: "/employer/jobs?filter=applications",
    });
  }

  for (const s of shifts.filter((x) => x.status === "in_progress")) {
    const forShift = bookings.filter((b) => b.shiftId === s.id);
    const expected = forShift.filter((b) => COUNTS_AS_FILLED.includes(b.status)).length;
    const checkedIn = forShift.filter((b) => b.status === "checked_in" || b.status === "completed").length;
    items.push({
      id: `attendance-${s.id}`,
      kind: "attendance",
      title: `${s.title} is under way`,
      description: `${checkedIn} of ${expected} checked in · started ${s.startTime}`,
      href: `/employer/jobs/${s.id}?tab=attendance`,
      urgent: checkedIn < expected,
    });
  }

  const short = shifts
    .filter((s) => s.status === "open" && shiftEndsAfter(s, now))
    .map((s) => ({ s, gap: s.workersNeeded - confirmedCount(bookings, s.id), days: differenceInCalendarDays(parseISO(s.date), now) }))
    .filter(({ s, gap, days }) => gap > 0 && (s.urgent || days <= 2))
    .sort((a, b) => a.days - b.days);
  for (const { s, gap } of short) {
    items.push({
      id: `staffing-${s.id}`,
      kind: "staffing",
      title: `${s.title} is short-staffed`,
      description: `${pluralize(gap, "more worker")} needed · ${formatRelativeDay(s.date)} ${s.startTime}`,
      href: `/employer/jobs/${s.id}?tab=staffing`,
      urgent: true,
    });
  }

  // One card per shift, each linking straight to that shift's Review & approve tab.
  const awaitingByShift = new Map<string, number>();
  for (const b of bookings.filter((x) => x.status === "completed" && !x.approvedAt)) {
    awaitingByShift.set(b.shiftId, (awaitingByShift.get(b.shiftId) ?? 0) + 1);
  }
  const toReview = shifts
    .filter((s) => awaitingByShift.has(s.id))
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
  for (const s of toReview) {
    const waiting = awaitingByShift.get(s.id) ?? 0;
    items.push({
      id: `review-${s.id}`,
      kind: "review",
      title: `${s.title} is ready to approve`,
      description: `${pluralize(waiting, "worker")} waiting for a rating before payout · ${formatRelativeDay(s.date)}`,
      href: `/employer/jobs/${s.id}?tab=review`,
    });
  }

  return items;
}

function invoiceItems(invoices: Invoice[], now: Date): AttentionItem[] {
  return invoices
    .filter((i) => i.status === "due" || i.status === "overdue")
    .map((inv) => {
      const days = differenceInCalendarDays(parseISO(inv.dueAt), now);
      const overdue = inv.status === "overdue" || days < 0;
      return {
        id: `invoice-${inv.id}`,
        kind: "invoice" as const,
        title: overdue ? `Invoice ${inv.number} is overdue` : `Invoice ${inv.number} due ${days === 0 ? "today" : `in ${pluralize(days, "day")}`}`,
        description: `${formatRwf(inv.total)} · ${pluralize(inv.lines.length, "shift")} this period`,
        href: `/employer/payments/${inv.id}`,
        urgent: days <= 3,
      };
    });
}

/** Both sides of the business on one list: events first, then staffing, then money. */
export function buildAttention(input: { events: Event[]; shifts: Shift[]; bookings: Booking[]; invoices: Invoice[]; now: Date }): AttentionItem[] {
  return [...eventItems(input.events), ...shiftItems(input.shifts, input.bookings, input.now), ...invoiceItems(input.invoices, input.now)];
}
