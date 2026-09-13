"use client";

import { motion } from "motion/react";
import { QrCode } from "lucide-react";
import { WorkerAvatar } from "@/components/ui/avatar";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { BookingStatusBadge } from "@/components/ui/status-badge";
import { useShiftBookings } from "@/features/bookings";
import { useWorkers } from "@/features/workers";
import { formatTimeRange } from "@/lib/utils";
import type { Booking, Shift } from "@/types";
import { TourFrame, TourRowsSkeleton, listMotion } from "./tour-frame";

const SHOWN: Booking["status"][] = ["checked_in", "confirmed", "completed", "no_show"];
const ORDER: Record<string, number> = { checked_in: 0, completed: 1, confirmed: 2, no_show: 3 };

function timeOf(iso?: string) {
  return iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : undefined;
}

/** Live attendance for the shift happening today (or the next filled one). */
export function TourAttendance({ shift, parentPending }: { shift?: Shift; parentPending: boolean }) {
  const bookings = useShiftBookings(shift?.id);
  const workers = useWorkers();
  const byId = new Map(workers.data?.map((w) => [w.id, w]) ?? []);

  const rows = (bookings.data ?? [])
    .filter((b) => SHOWN.includes(b.status))
    .sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9))
    .slice(0, 4);
  const onSite = bookings.data?.filter((b) => b.status === "checked_in" || b.status === "completed").length ?? 0;
  const isError = bookings.isError || workers.isError;
  const isPending = parentPending || (!!shift && (bookings.isPending || workers.isPending));

  return (
    <TourFrame title={shift ? `Attendance · ${shift.venue} · ${formatTimeRange(shift.startTime, shift.endTime)}` : "Attendance"}>
      {isError ? (
        <ErrorState compact title="Couldn't load attendance" error={bookings.error ?? workers.error} onRetry={() => { void bookings.refetch(); void workers.refetch(); }} retrying={bookings.isRefetching || workers.isRefetching} />
      ) : isPending ? (
        <TourRowsSkeleton rows={4} />
      ) : !shift || rows.length === 0 ? (
        <EmptyState compact icon={QrCode} title="No shift on site today" description="Once workers scan the QR code at the staff entrance, their check-in times appear here." />
      ) : (
        <>
          <div className="mb-3 flex items-baseline justify-between px-1 text-xs text-fg-muted">
            <span><span className="font-semibold text-fg tabular">{onSite}</span> of <span className="tabular">{shift.workersNeeded}</span> checked in</span>
            <span className="inline-flex items-center gap-1.5"><QrCode className="size-3.5" aria-hidden /> QR at staff entrance</span>
          </div>
          <ul className="flex flex-col gap-2">
            {rows.map((b, i) => {
              const w = byId.get(b.workerId);
              const t = timeOf(b.checkInAt);
              return (
                <motion.li
                  key={b.id}
                  initial={listMotion.initial}
                  animate={listMotion.animate}
                  transition={listMotion.transition(i)}
                  className="flex items-center gap-3 rounded-md border border-border p-3"
                >
                  {w ? <WorkerAvatar worker={w} size="sm" /> : <span className="size-8 rounded-full bg-ink-100" aria-hidden />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-fg">{w ? `${w.firstName} ${w.lastName}` : "Worker"}</p>
                    <p className="text-xs text-fg-muted">{t ? `Checked in ${t}` : b.status === "confirmed" ? "Expected · not yet scanned" : b.status === "no_show" ? "Did not arrive" : "Shift complete"}</p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </motion.li>
              );
            })}
          </ul>
        </>
      )}
    </TourFrame>
  );
}
