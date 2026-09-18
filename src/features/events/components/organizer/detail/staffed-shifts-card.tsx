"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RoleIcon } from "@/components/common";
import { Card, ShiftStatusBadge, Skeleton } from "@/components/ui";
import { ROLES } from "@/data/roles";
import { useShift } from "@/features/shifts";
import { formatRelativeDay, formatTimeRange } from "@/lib/utils";

const MAX = 3;

/** One row per shift; each is its own query so a missing shift never blanks the card. */
function StaffedShiftRow({ shiftId }: { shiftId: string }) {
  const q = useShift(shiftId);
  if (q.isPending) {
    return (
      <li className="flex items-center gap-3 px-5 py-3.5" aria-hidden>
        <Skeleton className="size-8 rounded-md" />
        <div className="flex-1"><Skeleton className="h-4 w-1/2" /><Skeleton className="mt-1.5 h-3 w-1/3" /></div>
      </li>
    );
  }
  if (q.isError) {
    return (
      <li>
        <Link href={`/employer/jobs/${shiftId}`} className="flex min-h-11 items-center justify-between gap-3 px-5 py-3.5 text-sm text-fg-muted hover:bg-ink-50">
          This shift is no longer in your Jobs <ChevronRight className="size-4 shrink-0" aria-hidden />
        </Link>
      </li>
    );
  }
  const s = q.data;
  return (
    <li>
      <Link href={`/employer/jobs/${s.id}`} className="flex min-h-11 items-center gap-3 px-5 py-3.5 hover:bg-ink-50">
        <RoleIcon role={s.role} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg">{s.title}</p>
          <p className="truncate text-xs text-fg-muted">{ROLES[s.role].short} · {formatRelativeDay(s.date)} · <span className="tabular">{formatTimeRange(s.startTime, s.endTime)}</span></p>
        </div>
        <ShiftStatusBadge status={s.status} />
        <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
      </Link>
    </li>
  );
}

/** The link back to the workforce product: the shifts you hired through GigSyc to run this event. */
export function StaffedShiftsCard({ shiftIds }: { shiftIds: string[] }) {
  const shown = shiftIds.slice(0, MAX);
  const more = shiftIds.length - shown.length;
  return (
    <section aria-labelledby="staffed-heading" className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="staffed-heading" className="text-lg font-semibold">Staffed by GigSyc</h2>
          <p className="mt-0.5 text-sm text-fg-muted">Shifts you&apos;ve posted to run this event.</p>
        </div>
        {more > 0 ? <Link href="/employer/jobs" className="text-sm font-medium text-navy-700 hover:underline">+{more} more in Jobs</Link> : null}
      </div>
      <Card>
        <ul className="divide-y divide-border">
          {shown.map((id) => <StaffedShiftRow key={id} shiftId={id} />)}
        </ul>
      </Card>
    </section>
  );
}
