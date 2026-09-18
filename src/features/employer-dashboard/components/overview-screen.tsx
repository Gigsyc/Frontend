"use client";

import Link from "next/link";
import { BadgeCheck, CalendarPlus, Plus } from "lucide-react";
import { EmployerMark } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { EMPLOYER_USERS } from "@/data/mocks/employers";
import { useAuth } from "@/features/auth/auth-provider";
import { useEmployerSession } from "@/features/session";
import { formatDayLong } from "@/lib/utils";
import { firstNameOf, greetingFor } from "../greeting";
import { useEmployerDashboard } from "../use-dashboard";
import { NeedsAttention } from "./needs-attention";
import { OverviewSkeleton } from "./overview-skeleton";
import { OverviewStats } from "./overview-stats";
import { RecentActivity } from "./recent-activity";
import { TopWorkers } from "./top-workers";
import { UpNextHero } from "./up-next-hero";
import { UpcomingShifts } from "./upcoming-shifts";
import { YourEvents } from "./your-events";

/**
 * /employer — the promoter's desk. The next event and who is coming lead; what needs a
 * decision follows; the four numbers and the two columns fill in the rest of the morning.
 */
export function EmployerOverviewScreen() {
  const { employerId } = useEmployerSession();
  const { user } = useAuth();
  const now = new Date();
  const dash = useEmployerDashboard(employerId);

  // The signed-in partner when there is one; otherwise the organisation's demo contact.
  const personName = user?.employerId === employerId ? user.name : EMPLOYER_USERS.find((u) => u.employerId === employerId)?.name;
  const employer = dash.employer;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={formatDayLong(now)}
        title={
          <span className="flex items-center gap-3">
            {employer ? <EmployerMark employer={employer} size="md" className="hidden sm:inline-flex" /> : null}
            <span>{greetingFor(now)}, {firstNameOf(personName)}</span>
          </span>
        }
        description={
          employer ? (
            <span className="inline-flex flex-wrap items-center gap-x-1.5">
              <span className="font-medium text-fg">{employer.name}</span>
              {employer.verified ? <BadgeCheck className="size-4 text-cyan-600" aria-label="Verified partner" /> : null}
              <span aria-hidden>·</span>
              <span>{employer.tagline}</span>
            </span>
          ) : "Here's what's coming up and what needs you."
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/employer/jobs/new"><Plus /> Post a shift</Link>
            </Button>
            <Button variant="accent" asChild>
              <Link href="/employer/events/new"><CalendarPlus /> Submit an event</Link>
            </Button>
          </>
        }
      />

      {dash.isPending ? (
        <OverviewSkeleton />
      ) : dash.isError || !dash.summary || !dash.upcoming || !dash.guests ? (
        <div className="rounded-lg bg-surface shadow-card">
          <ErrorState title="We couldn't load your overview" error={dash.error} onRetry={() => void dash.refetch()} />
        </div>
      ) : (
        <>
          <UpNextHero event={dash.upNext} hasAnyEvent={dash.hasAnyEvent ?? false} />
          <NeedsAttention items={dash.attention ?? []} />
          <OverviewStats summary={dash.summary} guests={dash.guests} liveEvents={dash.liveEvents ?? 0} />
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="flex flex-col gap-6">
              <YourEvents events={dash.nextEvents ?? []} />
              <UpcomingShifts items={dash.upcoming} total={dash.upcomingTotal ?? dash.upcoming.length} />
            </div>
            <div className="flex flex-col gap-6">
              <RecentActivity employerId={employerId} />
              <TopWorkers top={dash.summary.topWorkers} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
