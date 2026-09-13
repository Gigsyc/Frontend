"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, Clock, LogOut, MapPin, Phone, QrCode, Star } from "lucide-react";
import { BookingStatusBadge, Button, EmployerMark } from "@/components/ui";
import { formatRwf, formatTimeRange, shiftHours } from "@/lib/utils";
import { checkInOpensAt, employerShortName, formatClock, telHref } from "../lib";
import type { ScheduleItem } from "../types";
import { CheckInDialog } from "./check-in-dialog";
import { CheckOutDialog } from "./check-out-dialog";
import { RateEmployerDialog } from "./rate-employer-dialog";

/** Navy hero for the shift happening today. The primary action changes with the booking state. */
export function TodayCard({ item }: { item: ScheduleItem }) {
  const { booking, shift, employer } = item;
  const [checkIn, setCheckIn] = useState(false);
  const [checkOut, setCheckOut] = useState(false);
  const [rate, setRate] = useState<ScheduleItem | null>(null);
  const hours = shiftHours(shift.startTime, shift.endTime, shift.breakMinutes);
  const short = employerShortName(employer?.name);
  const total = shift.payPerShift + (shift.transportAllowance ?? 0);
  const received = booking.employerRating?.score;

  return (
    <section id="today-shift" aria-labelledby="today-title" className="scroll-mt-20 overflow-hidden rounded-lg bg-navy-900 text-white shadow-card">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span className="size-1.5 rounded-full bg-amber-400" aria-hidden /> Today
          </span>
          <BookingStatusBadge status={booking.status} />
        </div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="today-title" className="font-display text-xl font-semibold leading-tight text-white sm:text-2xl">{shift.title}</h2>
            <p className="mt-1.5 flex items-center gap-2 text-sm text-white/70">
              {employer ? <EmployerMark employer={employer} size="xs" className="ring-1 ring-white/25" /> : null}
              {employer?.name ?? "Employer"}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-lg font-semibold leading-none text-white tabular">{formatRwf(total)}</p>
            <p className="mt-1 text-[11px] text-white/60">{shift.transportAllowance ? "incl. transport" : "per shift"}{shift.mealProvided ? " · meal" : ""}</p>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex gap-2.5">
            <Clock className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
            <div>
              <dt className="sr-only">Time</dt>
              <dd className="font-medium tabular">{formatTimeRange(shift.startTime, shift.endTime)}</dd>
              <dd className="text-[13px] text-white/60">{hours}h with a {shift.breakMinutes}-minute break</dd>
            </div>
          </div>
          <div className="flex gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
            <div>
              <dt className="sr-only">Venue</dt>
              <dd className="font-medium">{shift.venue}</dd>
              <dd className="text-[13px] text-white/60">{shift.address}</dd>
            </div>
          </div>
          <div className="flex gap-2.5 sm:col-span-2">
            <Phone className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
            <div>
              <dt className="sr-only">Supervisor</dt>
              <dd className="font-medium">{shift.supervisor.name} <span className="font-normal text-white/60">· supervisor</span></dd>
              <dd>
                <a href={telHref(shift.supervisor.phone)} className="inline-flex min-h-11 items-center text-[13px] font-medium text-amber-300 underline-offset-4 hover:underline sm:min-h-0">
                  {shift.supervisor.phone}
                </a>
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="border-t border-white/10 p-4 sm:p-5">
        {booking.status === "confirmed" ? (
          <div className="flex flex-col gap-2">
            <Button variant="accent" size="lg" className="w-full" onClick={() => setCheckIn(true)}><QrCode /> Check in with QR</Button>
            <p className="text-center text-xs text-white/60">Check-in opens at <span className="tabular">{checkInOpensAt(shift)}</span> at the staff entrance.</p>
          </div>
        ) : null}
        {booking.status === "checked_in" ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/70">
              Checked in at <span className="font-semibold text-white tabular">{booking.checkInAt ? formatClock(booking.checkInAt) : "—"}</span>
            </p>
            <Button variant="accent" size="lg" className="w-full sm:w-auto" onClick={() => setCheckOut(true)}><LogOut /> Check out</Button>
          </div>
        ) : null}
        {booking.status === "completed" && booking.approvedAt ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5 text-sm">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-success-500" aria-hidden />
              <div>
                <p className="font-medium">
                  Approved · <span className="tabular">{formatRwf(total)}</span> on its way
                  {received !== undefined ? (
                    <span className="ml-2 inline-flex items-center gap-1 text-[13px] font-normal text-white/70" aria-label={`${short} rated you ${received.toFixed(1)} out of 5`}>
                      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                      <span className="font-semibold text-white tabular">{received.toFixed(1)}</span>
                    </span>
                  ) : null}
                </p>
                <p className="text-[13px] text-white/60">{short} approved your shift. MoMo payouts usually land within 48h.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {!booking.workerRating ? (
                <Button variant="on-dark" className="w-full sm:w-auto" onClick={() => setRate(item)}><Star /> Rate your experience</Button>
              ) : null}
              <Button asChild variant="on-dark" className="w-full sm:w-auto">
                <Link href="/worker/earnings">Track payout <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        ) : null}
        {booking.status === "completed" && !booking.approvedAt ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5 text-sm">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-success-500" aria-hidden />
              <div>
                <p className="font-medium">Completed · awaiting {short}&apos;s approval</p>
                <p className="text-[13px] text-white/60"><span className="tabular">{formatRwf(total)}</span> pays out after approval, usually within 48h.</p>
              </div>
            </div>
            {!booking.workerRating ? (
              <Button variant="on-dark" className="w-full sm:w-auto" onClick={() => setRate(item)}><Star /> Rate your experience</Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <CheckInDialog item={item} open={checkIn} onOpenChange={setCheckIn} />
      <CheckOutDialog item={item} open={checkOut} onOpenChange={setCheckOut} />
      <RateEmployerDialog item={rate} onOpenChange={(o) => !o && setRate(null)} />
    </section>
  );
}
