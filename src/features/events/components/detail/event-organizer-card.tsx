"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ROLES } from "@/data/roles";
import { EmployerMark } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployerVerifiedMark } from "@/components/ui/verified";
import { useShift } from "@/features/shifts/queries";
import { formatNumber } from "@/lib/utils";
import type { Employer } from "@/types";

interface OrganizerCardProps {
  organizer?: Employer;
  isPending: boolean;
}

/** Who is behind the event, and how much work they have actually run through GigSyc. */
export function EventOrganizerCard({ organizer, isPending }: OrganizerCardProps) {
  if (isPending) {
    return (
      <Card className="flex items-start gap-4 p-4 sm:p-5">
        <Skeleton className="size-10 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3.5 w-full max-w-sm" />
          <Skeleton className="h-3 w-56" />
        </div>
      </Card>
    );
  }
  if (!organizer) return null;

  const { shiftsPosted, workersEngaged, fillRate } = organizer.stats;

  return (
    <section aria-labelledby="organiser-heading" className="space-y-4">
      <h2 id="organiser-heading" className="text-lg font-semibold">Organiser</h2>
      <Card className="flex items-start gap-4 p-4 sm:p-5">
        <EmployerMark employer={organizer} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[15px] font-semibold">{organizer.name}</span>
            {organizer.verified ? <EmployerVerifiedMark /> : null}
          </p>
          <p className="mt-1 text-sm text-fg-muted">{organizer.tagline}</p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-fg">
            <span className="tabular">{formatNumber(shiftsPosted)}</span> shifts posted
            <span className="text-fg-subtle" aria-hidden>·</span>
            <span className="tabular">{formatNumber(workersEngaged)}</span> professionals engaged
            <span className="text-fg-subtle" aria-hidden>·</span>
            <span className="tabular">{fillRate}%</span> fill rate
          </p>
          <p className="mt-1.5 text-xs text-fg-subtle">
            Organiser on GigSyc since {format(parseISO(organizer.memberSince), "MMMM yyyy")}
          </p>
        </div>
      </Card>
    </section>
  );
}

/**
 * The link back to the workforce product: this event is staffed by GigSyc professionals.
 * At most two shifts are read — enough to name the roles without turning into a roster.
 */
export function EventStaffedCard({ shiftIds }: { shiftIds: string[] }) {
  const first = useShift(shiftIds[0]);
  const second = useShift(shiftIds[1]);

  if (shiftIds.length === 0) return null;

  const shifts = [first.data, second.data].filter((s) => s !== undefined);
  const loading = first.isPending || (shiftIds.length > 1 && second.isPending);
  // Roles only, never a headcount: `workersNeeded` is how many positions are open on the
  // shift, not how many people will be on the floor, and a shift can still be unfilled.
  const roles = Array.from(new Set(shifts.map((s) => ROLES[s.role].short)));

  return (
    <Card className="flex items-start gap-3 bg-navy-50/60 p-4 shadow-none">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-navy-900 text-white">
        <Users className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy-900">GigSyc professionals are working this event</p>
        {loading ? (
          <Skeleton className="mt-1.5 h-3.5 w-56" />
        ) : roles.length > 0 ? (
          <p className="mt-1 text-[13px] text-fg-muted">Verified staff on this event: {roles.join(", ")}.</p>
        ) : (
          <p className="mt-1 text-[13px] text-fg-muted">Verified staff on the door and floor.</p>
        )}
        <Link href="/business" className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-navy-700 hover:underline">
          Staff your own event <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
