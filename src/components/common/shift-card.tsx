"use client";

import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLES } from "@/data/roles";
import { cn, formatRelativeDay, formatRwf, formatTimeRange, shiftHours } from "@/lib/utils";
import type { Employer, Shift } from "@/types";

interface ShiftCardProps {
  shift: Shift;
  employer?: Pick<Employer, "name" | "verified">;
  href: string;
  /** Number of confirmed workers so far — shows "3 spots left" when close to full. */
  confirmed?: number;
  /** Small pill in the corner e.g. "Applied", "Invited" */
  badge?: React.ReactNode;
  layout?: "vertical" | "horizontal";
  className?: string;
}

/**
 * Worker-facing shift card. Pay is the hero, then when/where. Photo gives context, not decoration.
 */
export function ShiftCard({ shift, employer, href, confirmed, badge, layout = "vertical", className }: ShiftCardProps) {
  const hours = shiftHours(shift.startTime, shift.endTime, shift.breakMinutes);
  const left = typeof confirmed === "number" ? Math.max(0, shift.workersNeeded - confirmed) : undefined;
  const horizontal = layout === "horizontal";
  return (
    <Link
      href={href}
      className={cn(
        "group flex overflow-hidden rounded-lg bg-surface shadow-card transition-[box-shadow,transform] duration-200 ease-out-soft hover:shadow-raised hover:-translate-y-px focus-visible:outline-none focus-visible:shadow-focus",
        horizontal ? "flex-row" : "flex-col",
        className,
      )}
    >
      <div className={cn("relative shrink-0", horizontal ? "w-28 sm:w-40" : "")}>
        <Photo src={shift.coverImage} alt="" aspect={horizontal ? "auto" : "wide"} rounded={false} className={cn(horizontal && "h-full min-h-28")} sizes="(max-width: 640px) 100vw, 400px" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {shift.urgent ? <Badge tone="solid-amber"><Zap className="fill-current" /> Urgent</Badge> : null}
          {badge}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-fg-muted">{employer?.name ?? ROLES[shift.role].label}</p>
            <h3 className="mt-0.5 line-clamp-2 font-sans text-[15px] font-semibold leading-5 text-fg group-hover:text-navy-800">{shift.title}</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-lg font-semibold leading-none text-navy-900 tabular">{formatRwf(shift.payPerShift)}</p>
            <p className="mt-1 text-[11px] text-fg-muted">per shift · {hours}h</p>
          </div>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-fg-muted [&_svg]:size-3.5 [&_svg]:text-fg-subtle">
          <li className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden /><span className="text-fg">{formatRelativeDay(shift.date)}</span></li>
          <li className="inline-flex items-center gap-1.5"><Clock aria-hidden />{formatTimeRange(shift.startTime, shift.endTime)}</li>
          <li className="inline-flex items-center gap-1.5"><MapPin aria-hidden />{shift.district}</li>
        </ul>
        <div className="mt-auto flex items-center justify-between gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-fg-muted"><Users className="size-3.5" aria-hidden />{shift.workersNeeded} needed</span>
          {typeof left === "number" ? (
            <span className={cn("font-medium", left <= 3 && left > 0 ? "text-amber-700" : "text-fg-muted")}>{left === 0 ? "Fully booked" : `${left} spot${left === 1 ? "" : "s"} left`}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function ShiftCardSkeleton({ layout = "vertical" }: { layout?: "vertical" | "horizontal" }) {
  const horizontal = layout === "horizontal";
  return (
    <div className={cn("flex overflow-hidden rounded-lg bg-surface shadow-card", horizontal ? "flex-row" : "flex-col")} aria-hidden>
      <Skeleton className={cn("rounded-none", horizontal ? "w-28 sm:w-40" : "aspect-[21/9] w-full")} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex justify-between gap-3">
          <div className="flex-1"><Skeleton className="h-3 w-24" /><Skeleton className="mt-2 h-4 w-4/5" /></div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex gap-4"><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-14" /></div>
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
