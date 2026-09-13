"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { EMPLOYER_USERS } from "@/data/mocks/employers";
import { useEmployerSession } from "@/features/session";
import { formatDayLong } from "@/lib/utils";
import { firstNameOf, greetingFor } from "../greeting";
import { useEmployerDashboard } from "../use-dashboard";
import { NeedsAttention } from "./needs-attention";
import { OverviewSkeleton } from "./overview-skeleton";
import { OverviewStats } from "./overview-stats";
import { RecentActivity } from "./recent-activity";
import { TopWorkers } from "./top-workers";
import { UpcomingShifts } from "./upcoming-shifts";

export function EmployerOverviewScreen() {
  const { employerId } = useEmployerSession();
  const user = EMPLOYER_USERS.find((u) => u.employerId === employerId);
  const now = new Date();
  const dash = useEmployerDashboard(employerId);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greetingFor(now)}, ${firstNameOf(user?.name)}`}
        description={`${formatDayLong(now)} · Here's what needs you today.`}
        actions={
          <Button asChild>
            <Link href="/employer/jobs/new"><Plus /> Post a shift</Link>
          </Button>
        }
      />

      {dash.isPending ? (
        <OverviewSkeleton />
      ) : dash.isError || !dash.summary || !dash.upcoming ? (
        <div className="rounded-lg bg-surface shadow-card">
          <ErrorState title="We couldn't load your overview" error={dash.error} onRetry={() => void dash.refetch()} />
        </div>
      ) : (
        <>
          <NeedsAttention items={dash.attention ?? []} />
          <OverviewStats summary={dash.summary} confirmedThisWeek={dash.confirmedThisWeek ?? 0} shiftsThisWeek={dash.shiftsThisWeek ?? 0} />
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <UpcomingShifts items={dash.upcoming} total={dash.upcomingTotal ?? dash.upcoming.length} />
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
