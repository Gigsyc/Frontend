"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ClipboardCheck, MoreHorizontal, UserX, LogIn } from "lucide-react";
import { toast } from "sonner";
import {
  BookingStatusBadge, Button, Card, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, EmptyState, ErrorState, Skeleton, WorkerAvatar,
} from "@/components/ui";
import { useMarkNoShow, useShiftBookings } from "@/features/bookings";
import { hasShiftStarted } from "@/features/shifts/components/employer/shift-helpers";
import { cn } from "@/lib/utils";
import type { Shift } from "@/types";
import { SEATED, type StaffingRow, type useShiftStaffing } from "./use-shift-staffing";

interface AttendanceTabProps {
  shift: Shift;
  staffing: ReturnType<typeof useShiftStaffing>;
}

const clock = (iso?: string) => (iso ? format(parseISO(iso), "HH:mm") : "—");
const MEANINGFUL: ReadonlySet<Shift["status"]> = new Set<Shift["status"]>(["filled", "in_progress", "completed"]);

export function AttendanceTab({ shift, staffing }: AttendanceTabProps) {
  // Polled while this tab is open so check-ins arrive without a refresh (shares the cache with the staffing hook).
  useShiftBookings(shift.id, { refetchInterval: 15_000, enabled: MEANINGFUL.has(shift.status) });
  const [noShow, setNoShow] = useState<StaffingRow | null>(null);
  const markNoShow = useMarkNoShow();
  const started = hasShiftStarted(shift);

  if (!MEANINGFUL.has(shift.status)) {
    return <Card><EmptyState icon={ClipboardCheck} title="Attendance opens once the shift is filled" description="You'll see check-ins and check-outs here on the day, updated live." /></Card>;
  }
  if (staffing.isPending) return <Card><div className="divide-y divide-border" aria-busy>{[0, 1, 2, 3].map((i) => <div key={i} className="flex items-center gap-3 px-5 py-3"><Skeleton className="size-10 rounded-full" /><Skeleton className="h-4 w-40" /><Skeleton className="ml-auto h-5 w-20" /></div>)}</div></Card>;
  if (staffing.isError) return <ErrorState title="We couldn't load attendance" error={staffing.error} onRetry={() => void staffing.refetch()} retrying={staffing.isRefetching} />;

  const rows = staffing.rows.filter((r) => SEATED.has(r.booking.status) || r.booking.status === "no_show");
  const checkedIn = rows.filter((r) => r.booking.status === "checked_in" || r.booking.status === "completed").length;

  const confirmNoShow = () => {
    if (!noShow) return;
    markNoShow.mutate(noShow.booking.id, {
      onSuccess: () => { toast.success(`${noShow.worker.firstName} marked as no-show`, { description: "Their reliability score is updated. You won't be invoiced for this spot." }); setNoShow(null); },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't update. Try again."),
    });
  };
  const manualCheckIn = () => toast("Manual check-in isn't in the prototype", { description: "On the day, your supervisor does this from the GigSyc app." });

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-5 py-4">
        <p className="text-sm font-semibold"><span className="tabular">{checkedIn}</span> of <span className="tabular">{rows.length}</span> checked in</p>
        <p className="text-xs text-fg-muted">{started ? "Updates every 15 seconds while you're on this tab." : `Check-in opens at ${shift.startTime}. No-shows can be marked after that.`}</p>
      </div>
      {rows.length === 0 ? <EmptyState compact icon={ClipboardCheck} title="No one to track yet" description="Confirmed workers appear here." /> : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-xs font-medium text-fg-muted">{["Worker", "Status", "Check-in", "Check-out", ""].map((h, i) => <th key={i} scope="col" className="px-5 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.booking.id} className={cn("border-b border-border last:border-0", row.booking.status === "no_show" && "bg-danger-50/40")}>
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><WorkerAvatar worker={row.worker} size="sm" /><div className="min-w-0"><p className="truncate font-medium text-fg">{row.worker.firstName} {row.worker.lastName}</p><p className="truncate text-xs text-fg-muted">{row.worker.headline}</p></div></div></td>
                    <td className="px-5 py-3"><BookingStatusBadge status={row.booking.status} /></td>
                    <td className="px-5 py-3 tabular">{clock(row.booking.checkInAt)}</td>
                    <td className="px-5 py-3 tabular">{clock(row.booking.checkOutAt)}</td>
                    <td className="px-3 py-3 text-right"><RowActions row={row} started={started} onNoShow={setNoShow} onManualCheckIn={manualCheckIn} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-border md:hidden">
            {rows.map((row) => (
              <li key={row.booking.id} className="flex items-center gap-3 px-4 py-3">
                <WorkerAvatar worker={row.worker} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2"><span className="truncate text-sm font-medium">{row.worker.firstName} {row.worker.lastName}</span><BookingStatusBadge status={row.booking.status} /></div>
                  <p className="mt-0.5 text-xs text-fg-muted tabular">In {clock(row.booking.checkInAt)} · Out {clock(row.booking.checkOutAt)}</p>
                </div>
                <RowActions row={row} started={started} onNoShow={setNoShow} onManualCheckIn={manualCheckIn} />
              </li>
            ))}
          </ul>
        </>
      )}

      <Dialog open={!!noShow} onOpenChange={(o) => { if (!o && !markNoShow.isPending) setNoShow(null); }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Mark {noShow?.worker.firstName} as a no-show?</DialogTitle>
            <DialogDescription>Only do this if they haven&apos;t arrived and haven&apos;t been in touch. It lowers their reliability score and they won&apos;t be paid for this shift.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={markNoShow.isPending}>Not yet</Button></DialogClose>
            <Button variant="danger" onClick={confirmNoShow} loading={markNoShow.isPending}>Mark no-show</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function RowActions({ row, started, onNoShow, onManualCheckIn }: { row: StaffingRow; started: boolean; onNoShow: (row: StaffingRow) => void; onManualCheckIn: () => void }) {
  const confirmed = row.booking.status === "confirmed";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${row.worker.firstName} ${row.worker.lastName}`} className="size-11 shrink-0 text-fg-muted md:size-10"><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={!confirmed} onSelect={onManualCheckIn}><LogIn /> Manual check-in</DropdownMenuItem>
        <DropdownMenuItem destructive disabled={!confirmed || !started} onSelect={() => onNoShow(row)}><UserX /> Mark no-show</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
