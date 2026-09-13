"use client";

import { AlertTriangle, RefreshCw, UserPlus } from "lucide-react";
import { Button, Card, CardContent, FillMeter, Skeleton } from "@/components/ui";
import type { Shift } from "@/types";

interface StaffingBarProps {
  shift: Shift;
  /** null while the bookings/workers queries are still loading. */
  counts: { filled: number; applied: number; invited: number } | null;
  onInvite: () => void;
  canInvite: boolean;
  /** Staffing couldn't be loaded — show a retry instead of skeletons that never resolve. */
  isError?: boolean;
  onRetry?: () => void;
  retrying?: boolean;
}

/** The one number an ops manager checks first: how many of the seats are actually covered. */
export function StaffingBar({ shift, counts, onInvite, canInvite, isError, onRetry, retrying }: StaffingBarProps) {
  const stats = counts
    ? [
        { label: "Confirmed", value: counts.filled, tone: "text-success-700" },
        { label: "Applied", value: counts.applied, tone: counts.applied ? "text-cyan-700" : "text-fg" },
        { label: "Invited", value: counts.invited, tone: "text-fg" },
        { label: "Needed", value: shift.workersNeeded, tone: "text-fg" },
      ]
    : null;

  const invite = canInvite ? (
    <Button onClick={onInvite} variant="secondary" className="h-11 w-full sm:h-10 lg:w-auto">
      <UserPlus /> Invite workers
    </Button>
  ) : null;

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div role="alert" className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-3">
            <p className="inline-flex items-center gap-2 text-sm text-fg">
              <AlertTriangle className="size-4 shrink-0 text-danger-600" aria-hidden />
              Couldn&apos;t load staffing. The shift itself is fine.
            </p>
            {onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry} loading={retrying} className="h-11 sm:h-8">
                <RefreshCw /> Try again
              </Button>
            ) : null}
          </div>
          {invite}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:gap-8">
        <div className="min-w-0 flex-1">
          {counts ? (
            <FillMeter filled={counts.filled} needed={shift.workersNeeded} />
          ) : (
            <div className="flex flex-col gap-2"><Skeleton className="h-3 w-40" /><Skeleton className="h-2 w-full" /></div>
          )}
        </div>
        <dl className="grid grid-cols-4 gap-3 sm:gap-6">
          {(stats ?? Array.from({ length: 4 }, () => null)).map((s, i) => (
            <div key={s?.label ?? i} className="flex flex-col">
              {s ? (
                <>
                  <dd className={`font-display text-2xl font-semibold leading-none tabular ${s.tone}`}>{s.value}</dd>
                  <dt className="mt-1 text-xs text-fg-muted">{s.label}</dt>
                </>
              ) : (
                <><Skeleton className="h-6 w-8" /><Skeleton className="mt-1.5 h-3 w-14" /></>
              )}
            </div>
          ))}
        </dl>
        {invite}
      </CardContent>
    </Card>
  );
}
