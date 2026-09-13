"use client";

import { motion } from "motion/react";
import { RoleIcon } from "@/components/common/role-icon";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { FillMeter } from "@/components/ui/progress";
import { ShiftStatusBadge } from "@/components/ui/status-badge";
import { formatRelativeDay, formatRwf } from "@/lib/utils";
import { Briefcase } from "lucide-react";
import type { Shift } from "@/types";
import { TourFrame, TourRowsSkeleton, listMotion } from "./tour-frame";

interface Props {
  shifts?: Shift[];
  confirmedByShift?: Map<string, number>;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  isRefetching: boolean;
  onRetry: () => void;
}

/** The Jobs list as the employer sees it: role, when, pay, and how full it is. */
export function TourJobs({ shifts, confirmedByShift, isPending, isError, error, isRefetching, onRetry }: Props) {
  const rows = shifts?.slice(0, 4) ?? [];
  return (
    <TourFrame title="Jobs · Ikaze Hospitality Group">
      {isError ? (
        <ErrorState compact title="Couldn't load jobs" error={error} onRetry={onRetry} retrying={isRefetching} />
      ) : isPending ? (
        <TourRowsSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState compact icon={Briefcase} title="No active jobs" description="Every shift is completed. Post one and it appears here with a live fill meter." />
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((s, i) => (
            <motion.li
              key={s.id}
              initial={listMotion.initial}
              animate={listMotion.animate}
              transition={listMotion.transition(i)}
              className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-md border border-border p-3 sm:grid-cols-[auto_1.4fr_1fr_auto] sm:gap-4"
            >
              <RoleIcon role={s.role} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">{s.title}</p>
                <p className="mt-0.5 text-xs text-fg-muted">{formatRelativeDay(s.date)} · {s.startTime} · <span className="tabular">{formatRwf(s.payPerShift)}</span></p>
              </div>
              <FillMeter filled={confirmedByShift?.get(s.id) ?? 0} needed={s.workersNeeded} className="col-span-2 sm:col-span-1" />
              <ShiftStatusBadge status={s.status} className="col-start-2 w-fit sm:col-start-auto" />
            </motion.li>
          ))}
        </ul>
      )}
    </TourFrame>
  );
}
