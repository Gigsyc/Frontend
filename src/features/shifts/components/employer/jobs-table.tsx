"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { RoleIcon } from "@/components/common";
import { Badge, FillMeter, ShiftStatusBadge, Skeleton } from "@/components/ui";
import { ROLES } from "@/data/roles";
import { cn, formatRelativeDay, formatRwf, formatTimeRange } from "@/lib/utils";
import type { Shift } from "@/types";
import { EMPTY_COUNTS, type BookingCounts } from "./shift-helpers";
import { JobRowMenu } from "./job-row-menu";
import { useStaggerOnce } from "@/lib/motion";

interface JobsTableProps {
  shifts: Shift[];
  counts: Record<string, BookingCounts>;
  onDuplicate: (shift: Shift) => void;
  onCancel: (shift: Shift) => void;
}

const HEAD = ["Shift", "Date & time", "Staffing", "Pay", "Status", ""];

/** Drafts can be saved before a venue is chosen, so fall back rather than render a dangling separator. */
const venueOf = (s: Shift) => s.venue.trim() || "No venue yet";

function AppliedNote({ n }: { n: number }) {
  if (!n) return null;
  return <span className="text-xs font-medium text-cyan-700 tabular">{n} applied</span>;
}

/** Desktop table + stacked cards under md. Row click navigates; actions live in the ⋯ menu. */
export function JobsTable({ shifts, counts, onDuplicate, onCancel }: JobsTableProps) {
  const router = useRouter();
  const stagger = useStaggerOnce(true);
  const go = (id: string) => router.push(`/employer/jobs/${id}`);

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-fg-muted">
              {HEAD.map((h, i) => <th key={i} scope="col" className={cn("px-5 py-3 font-medium", i === 3 && "text-right")}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {shifts.map((s, i) => {
              const c = counts[s.id] ?? EMPTY_COUNTS;
              return (
                <motion.tr
                  key={s.id}
                  {...stagger(i)}
                  onClick={() => go(s.id)}
                  className="group cursor-pointer border-b border-border last:border-0 hover:bg-ink-50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <RoleIcon role={s.role} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/employer/jobs/${s.id}`} className="truncate font-medium text-fg group-hover:text-navy-800" onClick={(e) => e.stopPropagation()}>{s.title}</Link>
                          {s.urgent ? <Badge tone="solid-amber"><Zap className="fill-current" /> Urgent</Badge> : null}
                        </div>
                        <p className="truncate text-xs text-fg-muted">{venueOf(s)} · {ROLES[s.role].short}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <p className="text-fg">{formatRelativeDay(s.date)}</p>
                    <p className="text-xs text-fg-muted tabular">{formatTimeRange(s.startTime, s.endTime)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {s.status === "draft" ? (
                      <span className="text-xs text-fg-muted tabular">{s.workersNeeded} needed · not posted</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <FillMeter filled={c.filled} needed={s.workersNeeded} showLabel={false} className="w-20" />
                        <span className="text-xs text-fg tabular">{c.filled}/{s.workersNeeded}</span>
                        <AppliedNote n={c.applied} />
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right font-display font-semibold text-navy-900 tabular">{formatRwf(s.payPerShift)}</td>
                  <td className="px-5 py-3.5"><ShiftStatusBadge status={s.status} /></td>
                  <td className="px-3 py-3.5 text-right"><JobRowMenu shift={s} onDuplicate={onDuplicate} onCancel={onCancel} /></td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {shifts.map((s, i) => {
          const c = counts[s.id] ?? EMPTY_COUNTS;
          return (
            <motion.li key={s.id} {...stagger(i)} className="relative">
              <Link href={`/employer/jobs/${s.id}`} className="flex min-h-11 flex-col gap-3 p-4 pr-14 active:bg-ink-50">
                <div className="flex items-start gap-3">
                  <RoleIcon role={s.role} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-medium leading-5 text-fg">{s.title}</p>
                    <p className="mt-0.5 truncate text-xs text-fg-muted">{venueOf(s)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
                  <span className="text-fg">{formatRelativeDay(s.date)}</span>
                  <span className="tabular">{formatTimeRange(s.startTime, s.endTime)}</span>
                  <span className="font-display font-semibold text-navy-900 tabular">{formatRwf(s.payPerShift)}</span>
                  <ShiftStatusBadge status={s.status} />
                  {s.urgent ? <Badge tone="solid-amber"><Zap className="fill-current" /> Urgent</Badge> : null}
                </div>
                {s.status !== "draft" ? (
                  <div className="flex items-center gap-3">
                    <FillMeter filled={c.filled} needed={s.workersNeeded} showLabel={false} className="max-w-40 flex-1" />
                    <span className="text-xs text-fg tabular">{c.filled}/{s.workersNeeded} confirmed</span>
                    <AppliedNote n={c.applied} />
                  </div>
                ) : null}
              </Link>
              <div className="absolute right-2 top-2">
                <JobRowMenu shift={s} onDuplicate={onDuplicate} onCancel={onCancel} triggerClassName="size-11 md:size-8" />
              </div>
            </motion.li>
          );
        })}
      </ul>
    </>
  );
}

export function JobsTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-hidden className="divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="size-8 rounded-md" />
          <div className="flex-1"><Skeleton className="h-4 w-2/3 max-w-72" /><Skeleton className="mt-2 h-3 w-1/3 max-w-40" /></div>
          <Skeleton className="hidden h-4 w-24 md:block" />
          <Skeleton className="hidden h-2 w-20 md:block" />
          <Skeleton className="hidden h-4 w-20 md:block" />
          <Skeleton className="h-5 w-16 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
