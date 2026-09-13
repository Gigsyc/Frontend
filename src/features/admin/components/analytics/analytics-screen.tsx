"use client";

import Link from "next/link";
import { BarChart3, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsStatTiles } from "./analytics-stats";
import { AdminAnalyticsSkeleton } from "./analytics-skeleton";
import { BusiestOrganisers } from "./busiest-organisers";
import { CategoryChart } from "./category-chart";
import { PlaceMix } from "./place-mix";
import { PlatformInsights } from "./platform-insights";
import { PopularEventsTable } from "./popular-events-table";
import { usePlatformAnalytics } from "./use-platform-analytics";

const exportReport = () =>
  toast("Report export is not part of the prototype.", {
    description: "In the product this downloads a CSV of every event, organiser and attendance figure.",
  });

/** /admin/analytics — what the published calendar looks like, derived from the same data everywhere else uses. */
export function AdminAnalyticsScreen() {
  const view = usePlatformAnalytics();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="What is live on the public site: which categories and places carry the calendar, and who fills it."
        actions={<Button variant="outline" onClick={exportReport}><Download /> Export</Button>}
      />

      {view.isError ? (
        <Card>
          <ErrorState
            title="We couldn't load analytics"
            error={view.error}
            onRetry={() => view.refetch()}
            retrying={view.isRefetching}
          />
        </Card>
      ) : view.isPending ? (
        <AdminAnalyticsSkeleton />
      ) : view.totals.published === 0 ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="Nothing is published yet"
            description="Analytics count only events that are live on the public site. Approve one in the review queue to start the numbers."
            action={<Button variant="outline" asChild><Link href="/admin/events?status=pending_review">Open the review queue</Link></Button>}
          />
        </Card>
      ) : (
        <>
          <AnalyticsStatTiles totals={view.totals} />

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <CategoryChart slices={view.categories} />
            <PlaceMix slices={view.places} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <PopularEventsTable events={view.popular} />
            <div className="space-y-6">
              <BusiestOrganisers rows={view.organisers} />
              <PlatformInsights items={view.insights} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
