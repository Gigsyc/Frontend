"use client";

import Link from "next/link";
import { ChevronLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Photo } from "@/components/ui/photo";
import { ShiftStatusBadge } from "@/components/ui/status-badge";
import { ROLES } from "@/data/roles";
import { useShiftBookings } from "@/features/bookings/queries";
import { useWorkerShiftBooking } from "@/features/bookings/components/worker";
import { useEmployers } from "@/features/employers/queries";
import { useWorkerSession } from "@/features/session";
import { isNotFoundError } from "@/lib/utils";
import type { BookingStatus } from "@/types";
import { useShift } from "../../queries";
import { EmployerAboutCard, EmployerRow } from "./employer-cards";
import { ShareButton } from "./share-button";
import { ShiftActionBar } from "./shift-action-bar";
import { ShiftBrief } from "./shift-brief";
import { ShiftDetailSkeleton } from "./shift-detail-skeleton";
import { ShiftFacts } from "./shift-facts";
import { ShiftLocationCard } from "./shift-location-card";
import { SimilarShifts } from "./similar-shifts";

const SEATED: BookingStatus[] = ["confirmed", "checked_in", "completed"];


/** /worker/shifts/[id] — everything Aline needs to decide, then one thumb-reachable action. */
export function ShiftDetailScreen({ id }: { id: string }) {
  const { workerId } = useWorkerSession();
  const shiftQ = useShift(id);
  // The whole list is cached with staleTime Infinity from Discover, so this resolves without waiting on the shift.
  const employersQ = useEmployers();
  const shiftBookings = useShiftBookings(id);
  const { booking, isPending: bookingPending } = useWorkerShiftBooking(workerId, id);

  if (shiftQ.isPending) return <ShiftDetailSkeleton />;

  if (shiftQ.isError) {
    if (isNotFoundError(shiftQ.error)) {
      return (
        <EmptyState
          icon={SearchX}
          title="This shift isn't available"
          description="The employer may have taken it down, or the link is out of date. There's plenty more open right now."
          action={<Button asChild><Link href="/worker"><ChevronLeft /> Back to Discover</Link></Button>}
          className="rounded-lg bg-surface shadow-card"
        />
      );
    }
    return <ErrorState title="We couldn't load this shift" error={shiftQ.error} onRetry={() => void shiftQ.refetch()} retrying={shiftQ.isRefetching} className="rounded-lg bg-surface shadow-card" />;
  }

  const shift = shiftQ.data;
  const employer = employersQ.data?.find((e) => e.id === shift.employerId);
  const confirmed = (shiftBookings.data ?? []).filter((b) => SEATED.includes(b.status)).length;
  const showPhone = !!booking && SEATED.includes(booking.status);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/worker"
        backLabel="Discover"
        eyebrow={<span className="inline-flex items-center gap-2">{ROLES[shift.role].label} <ShiftStatusBadge status={shift.status} /></span>}
        title={shift.title}
        description={shift.description}
        actions={<ShareButton title={shift.title} />}
      />

      <Photo src={shift.coverImage} alt={`${shift.venue}, ${shift.district}`} aspect="video" priority sizes="(max-width: 768px) 100vw, 768px" />

      <EmployerRow
        employer={employer}
        isPending={employersQ.isPending}
        onRetry={employersQ.isError ? () => void employersQ.refetch() : undefined}
        retrying={employersQ.isRefetching}
      />

      <ShiftFacts shift={shift} confirmed={confirmed} bookingsLoading={shiftBookings.isPending} />
      <ShiftBrief shift={shift} showPhone={showPhone} />
      <ShiftLocationCard shift={shift} />
      {employer ? <EmployerAboutCard employer={employer} /> : null}

      <ShiftActionBar shift={shift} employerName={employer?.name} workerId={workerId} booking={booking} bookingPending={bookingPending} />

      <SimilarShifts shift={shift} />

      {/* Room for the fixed action bar on phones and tablets. */}
      <div className="h-16 lg:hidden" aria-hidden />
    </div>
  );
}
