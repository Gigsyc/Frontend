"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CalendarPlus, Send, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { FillMeter } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ShiftStatusBadge } from "@/components/ui/status-badge";
import { ROLES } from "@/data/roles";
import { useEmployerBookings, useInviteWorker } from "@/features/bookings";
import { useEmployerShifts } from "@/features/shifts";
import { cn, formatRelativeDay, formatTimeRange } from "@/lib/utils";
import type { BookingStatus, Shift, Worker } from "@/types";

const LIVE: BookingStatus[] = ["invited", "applied", "confirmed", "checked_in"];

interface Option { shift: Shift; confirmed: number; alreadyOn: boolean; skillMatch: boolean }

/** Upcoming open/filled shifts for this employer, skill matches first, then soonest. */
function useInviteOptions(employerId: string, worker: Worker) {
  const shifts = useEmployerShifts(employerId);
  const bookings = useEmployerBookings(employerId);
  const options = useMemo<Option[] | undefined>(() => {
    if (!shifts.data || !bookings.data) return undefined;
    const today = format(new Date(), "yyyy-MM-dd");
    const all = bookings.data;
    return shifts.data
      .filter((s) => (s.status === "open" || s.status === "filled") && s.date >= today)
      .map((shift) => {
        const forShift = all.filter((b) => b.shiftId === shift.id);
        return {
          shift,
          confirmed: forShift.filter((b) => b.status === "confirmed" || b.status === "checked_in").length,
          alreadyOn: forShift.some((b) => b.workerId === worker.id && LIVE.includes(b.status)),
          skillMatch: worker.skills.includes(shift.role),
        };
      })
      .sort((a, b) => Number(b.skillMatch) - Number(a.skillMatch) || `${a.shift.date}T${a.shift.startTime}`.localeCompare(`${b.shift.date}T${b.shift.startTime}`));
  }, [shifts.data, bookings.data, worker.id, worker.skills]);
  return {
    options,
    isPending: shifts.isPending || bookings.isPending,
    isError: shifts.isError || bookings.isError,
    error: shifts.error ?? bookings.error,
    refetch: () => { if (shifts.isError) shifts.refetch(); if (bookings.isError) bookings.refetch(); },
  };
}

function ShiftOption({ option, selected, onSelect }: { option: Option; selected: boolean; onSelect: () => void }) {
  const { shift, confirmed, alreadyOn, skillMatch } = option;
  const id = `invite-${shift.id}`;
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border p-3 transition-colors has-[:focus-visible]:shadow-focus",
        alreadyOn ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-ink-400",
        selected ? "border-navy-900 bg-navy-50/40" : "border-border",
      )}
    >
      <input id={id} type="radio" name="invite-shift" className="sr-only" checked={selected} disabled={alreadyOn} onChange={onSelect} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-fg">{shift.title}</p>
          <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-fg-muted">
            <span className="text-fg">{formatRelativeDay(shift.date)}</span>
            <span>{formatTimeRange(shift.startTime, shift.endTime)}</span>
            <span className="truncate">{shift.venue}</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {shift.urgent ? <Badge tone="solid-amber"><Zap className="fill-current" /> Urgent</Badge> : null}
          <ShiftStatusBadge status={shift.status} />
        </div>
      </div>
      <FillMeter filled={confirmed} needed={shift.workersNeeded} />
      {alreadyOn ? (
        <p className="text-xs font-medium text-fg-muted">Already on this shift</p>
      ) : skillMatch ? (
        <p className="text-xs font-medium text-success-700">Matches their skills · {ROLES[shift.role].label}</p>
      ) : (
        <p className="text-xs text-fg-muted">Outside their listed skills · {ROLES[shift.role].label}</p>
      )}
    </label>
  );
}

interface Props { employerId: string; worker: Worker; open: boolean; onOpenChange: (open: boolean) => void }

/** Pick one of the employer's upcoming shifts and send the worker an invitation. */
export function InviteToShiftDialog({ employerId, worker, open, onOpenChange }: Props) {
  const { options, isPending, isError, error, refetch } = useInviteOptions(employerId, worker);
  const invite = useInviteWorker();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = options?.find((o) => o.shift.id === selectedId);

  const send = () => {
    if (!selected) return;
    const { shift } = selected;
    invite.mutate(
      { shiftId: shift.id, workerId: worker.id },
      {
        onSuccess: () => {
          toast.success(`Invite sent to ${worker.firstName}`, {
            description: `${shift.title} · ${formatRelativeDay(shift.date)}. They can accept or decline from their app.`,
          });
          setSelectedId(null);
          onOpenChange(false);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !invite.isPending && onOpenChange(o)}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Invite {worker.firstName} {worker.lastName} to a shift</DialogTitle>
          <DialogDescription>Pick one of your upcoming shifts. {worker.firstName} gets a notification and can accept or decline.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isPending ? (
            <div className="space-y-2" aria-busy="true">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : isError || !options ? (
            <ErrorState compact error={error} onRetry={refetch} />
          ) : options.length === 0 ? (
            <EmptyState
              compact
              icon={CalendarPlus}
              title="No upcoming shifts to invite to"
              description={`Post a shift first, then invite ${worker.firstName} to it.`}
              action={<Button size="sm" asChild><Link href="/employer/jobs/new">Post a shift</Link></Button>}
            />
          ) : (
            <fieldset className="space-y-2">
              <legend className="sr-only">Choose a shift</legend>
              {options.map((o) => (
                <ShiftOption key={o.shift.id} option={o} selected={o.shift.id === selectedId} onSelect={() => setSelectedId(o.shift.id)} />
              ))}
            </fieldset>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={invite.isPending}>Cancel</Button>
          <Button onClick={send} disabled={!selected || selected.alreadyOn} loading={invite.isPending}><Send /> Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
