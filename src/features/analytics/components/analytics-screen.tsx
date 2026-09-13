"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/tabs";
import { useEmployerSession } from "@/features/session";
import { AnalyticsSkeleton } from "./analytics-skeleton";
import { AnalyticsStats } from "./analytics-stats";
import { EngagedWorkersTable } from "./engaged-workers-table";
import { Insights } from "./insights";
import { RoleMix } from "./role-mix";
import { SpendChart } from "./spend-chart";
import { useAnalyticsView } from "./use-analytics-view";

type Range = "30" | "90";

export function AnalyticsScreen() {
  const { employerId } = useEmployerSession();
  const [range, setRange] = useState<Range>("90");
  const view = useAnalyticsView(employerId);

  const weeks = view.summary ? (range === "30" ? view.summary.weeklySpend.slice(-4) : view.summary.weeklySpend) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="How quickly your shifts fill, who turns up, and what you're spending on workers."
        actions={
          <>
            <Segmented ariaLabel="Date range" value={range} onChange={setRange} options={[{ value: "30", label: "30 days" }, { value: "90", label: "90 days" }]} />
            <Button variant="outline" onClick={() => toast("Report export is not part of the prototype.", { description: "In the product this downloads a CSV of every shift, booking and invoice line." })}>
              <Download /> Export
            </Button>
          </>
        }
      />

      {view.isPending ? (
        <AnalyticsSkeleton />
      ) : view.isError || !view.summary || !view.benchmarks ? (
        <div className="rounded-lg bg-surface shadow-card">
          <ErrorState title="We couldn't load your analytics" error={view.error} onRetry={() => void view.refetch()} />
        </div>
      ) : (
        <>
          <AnalyticsStats summary={view.summary} benchmarks={view.benchmarks} />
          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <SpendChart weeks={weeks} label={range === "30" ? "Last 4 weeks" : "Last 8 weeks"} />
            <RoleMix mix={view.summary.roleMix} />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <EngagedWorkersTable rows={view.engaged ?? []} />
            <Insights items={view.insights ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
