"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { InviteList, useBookingStatusByShift } from "@/features/bookings/components/worker";
import { useWorkerBookings } from "@/features/bookings/queries";
import { useEmployers } from "@/features/employers/queries";
import { useWorkerSession } from "@/features/session";
import { useOpenShifts } from "@/features/shifts/queries";
import { useWorker } from "@/features/workers/queries";
import { pluralize } from "@/lib/utils";
import type { Employer } from "@/types";
import { countSheetFilters, hasAnyFilter, sortLabel, toShiftFilters } from "../filters";
import { useDiscoverFilters } from "../use-discover-filters";
import { greeting } from "../utils";
import { DiscoverSearch } from "./discover-search";
import { FilterSheet } from "./filter-sheet";
import { LookingForCard } from "./looking-for-card";
import { RoleChipRow } from "./role-chip-row";
import { ShiftResults } from "./shift-results";

const EMPTY_SKILLS: never[] = [];

/** /worker — Aline's feed of open shifts, with invitations pinned on top. */
export function DiscoverScreen() {
  const { workerId } = useWorkerSession();
  const { data: worker } = useWorker(workerId);
  const { state, update, clear, resetCount } = useDiscoverFilters();
  const [sheetOpen, setSheetOpen] = useState(false);

  const skills = worker?.skills ?? EMPTY_SKILLS;
  const filters = useMemo(() => toShiftFilters(state, skills), [state, skills]);
  const shifts = useOpenShifts(filters);
  // Same query the "This week" date chip runs, so the header count and the filtered feed can never disagree.
  const thisWeek = useOpenShifts({ dateRange: "week" });
  const employers = useEmployers();
  const bookings = useWorkerBookings(workerId);
  const bookingByShift = useBookingStatusByShift(workerId);

  const employerById = useMemo(() => new Map<string, Employer>((employers.data ?? []).map((e) => [e.id, e])), [employers.data]);
  const invites = useMemo(() => (bookings.data ?? []).filter((b) => b.status === "invited"), [bookings.data]);
  const weekCount = thisWeek.data?.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={greeting(worker?.firstName)}
        title="Find your next shift"
        description={
          weekCount === undefined
            ? <span className="inline-block h-3.5 w-48 align-middle skeleton" aria-hidden />
            : weekCount === 0
              ? "No open shifts left in Kigali this week — browse what's coming up below"
              : `${pluralize(weekCount, "open shift")} in Kigali this week`
        }
      />

      <InviteList invites={invites} employerById={employerById} />

      <div className="space-y-3">
        <DiscoverSearch
          key={resetCount}
          query={state.query}
          onQuery={(query) => update({ query })}
          dateRange={state.dateRange}
          onDateRange={(dateRange) => update({ dateRange })}
        />
        <RoleChipRow state={state} skills={skills} filterCount={countSheetFilters(state)} onChange={update} onOpenFilters={() => setSheetOpen(true)} />
      </div>

      <ShiftResults
        shifts={shifts.data}
        isPending={shifts.isPending}
        isError={shifts.isError}
        error={shifts.error}
        isRefetching={shifts.isRefetching}
        isStale={shifts.isPlaceholderData && shifts.isFetching}
        refetch={() => void shifts.refetch()}
        employerById={employerById}
        bookingByShift={bookingByShift}
        sortLabel={sortLabel(state.sort)}
        hasFilters={hasAnyFilter(state)}
        skills={skills}
        onClear={clear}
      />

      <LookingForCard />

      <FilterSheet open={sheetOpen} onOpenChange={setSheetOpen} state={state} skills={skills} onApply={update} />
    </div>
  );
}
