"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Ellipsis, ExternalLink, Hourglass, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui";
import { useRespondToInvite } from "@/features/bookings";
import { formatRelativeDay, formatRwf, formatTimeRange } from "@/lib/utils";
import { employerShortName } from "../lib";
import type { ScheduleItem } from "../types";

interface RowProps {
  item: ScheduleItem;
  onWithdraw: (item: ScheduleItem) => void;
}

/** Confirmed shift on a future date. Time column, details, pay and a ⋯ menu. */
export function UpcomingRow({ item, onWithdraw }: RowProps) {
  const { shift, employer } = item;
  const total = shift.payPerShift + (shift.transportAllowance ?? 0);
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-12 shrink-0 text-center">
        <p className="font-display text-base font-semibold leading-tight text-navy-900 tabular">{shift.startTime}</p>
        <p className="text-[11px] text-fg-muted tabular">{shift.endTime}</p>
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/worker/shifts/${shift.id}`} className="block truncate text-[15px] font-semibold text-fg hover:text-navy-800">{shift.title}</Link>
        <p className="truncate text-[13px] text-fg-muted">{employer?.name ?? "Employer"} · {shift.venue}</p>
      </div>
      <p className="shrink-0 font-display text-[15px] font-semibold text-navy-900 tabular">{formatRwf(total)}</p>
      <RowMenu item={item} onWithdraw={onWithdraw} withdrawLabel="Withdraw from shift" />
    </div>
  );
}

/** Application waiting on the employer, or an invitation the worker must answer. */
export function PendingRow({ item, onWithdraw }: RowProps) {
  const { shift, employer, booking } = item;
  const invited = booking.status === "invited";
  const short = employerShortName(employer?.name);
  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <DateColumn date={shift.date} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/worker/shifts/${shift.id}`} className="truncate text-[15px] font-semibold text-fg hover:text-navy-800">{shift.title}</Link>
            {invited ? <Badge tone="navy">Invited</Badge> : null}
          </div>
          <p className="truncate text-[13px] text-fg-muted">
            {employer?.name ?? "Employer"} · <span className="tabular">{formatTimeRange(shift.startTime, shift.endTime)}</span> · <span className="tabular">{formatRwf(shift.payPerShift)}</span>
          </p>
        </div>
        {!invited ? <RowMenu item={item} onWithdraw={onWithdraw} withdrawLabel="Withdraw application" className="sm:hidden" /> : null}
      </div>
      {invited ? (
        <InviteActions item={item} />
      ) : (
        <div className="flex items-center gap-2 pl-[60px] sm:pl-0">
          <span className="inline-flex items-center gap-1.5 text-[13px] text-fg-muted"><Hourglass className="size-3.5" aria-hidden /> Waiting for {short}</span>
          <RowMenu item={item} onWithdraw={onWithdraw} withdrawLabel="Withdraw application" className="hidden sm:inline-flex" />
        </div>
      )}
    </div>
  );
}

/** Weekday over day-of-month, matching the week strip. Reads the ISO date directly so every row gets both lines. */
export function DateColumn({ date }: { date: string }) {
  const parsed = parseISO(date);
  return (
    <div className="w-12 shrink-0 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wide text-fg-muted">{format(parsed, "EEE")}</p>
      <p className="font-display text-base font-semibold leading-tight text-navy-900 tabular">{format(parsed, "d")}</p>
    </div>
  );
}

function InviteActions({ item }: { item: ScheduleItem }) {
  const respond = useRespondToInvite();
  const short = employerShortName(item.employer?.name);
  const answer = (accept: boolean) =>
    respond.mutate(
      { bookingId: item.booking.id, accept },
      {
        onSuccess: () => {
          if (accept) toast.success(`You're confirmed for ${item.shift.title}`, { description: `${formatRelativeDay(item.shift.date)} · ${formatTimeRange(item.shift.startTime, item.shift.endTime)}. Details are in Upcoming.` });
          else toast(`Declined ${short}'s invitation`, { description: "No effect on your reliability." });
        },
        onError: (err) => toast.error(err.message),
      },
    );
  return (
    <div className="grid grid-cols-2 gap-2 pl-[60px] sm:pl-0 sm:shrink-0">
      <Button variant="outline" size="md" onClick={() => answer(false)} disabled={respond.isPending} loading={respond.isPending && respond.variables?.accept === false}>Decline</Button>
      <Button size="md" onClick={() => answer(true)} disabled={respond.isPending} loading={respond.isPending && respond.variables?.accept === true}>Accept</Button>
    </div>
  );
}

function RowMenu({ item, onWithdraw, withdrawLabel, className }: RowProps & { withdrawLabel: string; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${item.shift.title}`} className={className}><Ellipsis /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild><Link href={`/worker/shifts/${item.shift.id}`}><ExternalLink /> View shift</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => onWithdraw(item)}><LogOut /> {withdrawLabel}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
