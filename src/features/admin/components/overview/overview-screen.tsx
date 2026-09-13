"use client";

import { RefreshCw } from "lucide-react";
import { Button, Card, ErrorState, PageHeader } from "@/components/ui";
import { formatDayLong } from "@/lib/utils";
import { useAdminOverview } from "../../hooks/use-admin-overview";
import { ActivityFeed } from "./activity-feed";
import { AttentionPanel, AttentionPanelSkeleton } from "./attention-panel";
import { OverviewStatTiles, OverviewStatTilesSkeleton } from "./overview-stats";
import { PanelSkeleton } from "./panel";
import { PopularDestinations } from "./popular-destinations";
import { RecentSubmissions } from "./recent-submissions";
import { UpcomingEvents } from "./upcoming-events";

/**
 * /admin — the morning read. What needs a decision comes first, the four numbers that
 * describe the platform come second, and the detail columns come last.
 */
export function AdminOverviewScreen() {
  const overview = useAdminOverview();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description={`${formatDayLong(new Date())} — everything moving across GigSyc today.`}
      />

      {overview.isError ? (
        <Card>
          <ErrorState
            title="We couldn't load the console"
            error={overview.error}
            onRetry={() => overview.refetch()}
            retrying={overview.isRefetching}
          />
        </Card>
      ) : overview.isPending ? (
        <OverviewSkeleton />
      ) : (
        <>
          {overview.stale ? (
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-warning-100 bg-warning-50 px-4 py-2 text-[13px] text-warning-700">
              <span>Some of this stopped refreshing. You are looking at the last numbers we had.</span>
              <Button variant="ghost" size="sm" onClick={() => overview.refetch()} loading={overview.isRefetching}>
                <RefreshCw /> Try again
              </Button>
            </div>
          ) : null}
          <AttentionPanel rows={overview.attention} />
          <OverviewStatTiles stats={overview.stats} />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <RecentSubmissions events={overview.recentSubmissions} organizerName={overview.organizerName} />
              <UpcomingEvents events={overview.upcoming} />
            </div>
            <div className="space-y-6">
              <ActivityFeed items={overview.activity} />
              <PopularDestinations items={overview.destinations} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading the console">
      <AttentionPanelSkeleton />
      <OverviewStatTilesSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6"><PanelSkeleton rows={5} /><PanelSkeleton rows={5} /></div>
        <div className="space-y-6"><PanelSkeleton rows={6} /><PanelSkeleton rows={4} /></div>
      </div>
    </div>
  );
}
