"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { WorkerAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Rating } from "@/components/ui/rating";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmployerSummary } from "@/features/analytics";
import { useWorkers } from "@/features/workers";
import { pluralize } from "@/lib/utils";

export function TopWorkers({ top }: { top: EmployerSummary["topWorkers"] }) {
  const { data: workers, isPending, isError, error, refetch, isRefetching } = useWorkers({});
  const rows = top
    .map((t) => ({ ...t, worker: workers?.find((w) => w.id === t.workerId) }))
    .filter((r) => r.worker)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Your top workers</CardTitle>
        <Button variant="ghost" size="sm" asChild><Link href="/employer/talent">Talent</Link></Button>
      </CardHeader>
      <div className="px-5 pb-5 pt-3">
        {isPending ? (
          <div className="flex flex-col gap-3">{[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-3"><Skeleton className="size-8 rounded-full" /><div className="flex-1"><Skeleton className="h-3.5 w-32" /><Skeleton className="mt-1.5 h-3 w-20" /></div></div>)}</div>
        ) : isError ? (
          <ErrorState compact title="Couldn't load workers" error={error} onRetry={() => void refetch()} retrying={isRefetching} />
        ) : rows.length === 0 ? (
          <EmptyState compact icon={Star} title="No ratings yet" description="Once you approve and rate completed shifts, your best-rated workers appear here." />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {rows.map(({ worker, shifts, avgRating }) => worker ? (
              <li key={worker.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <Link href={`/employer/talent/${worker.id}`} className="rounded-full"><WorkerAvatar worker={worker} size="sm" /></Link>
                <span className="min-w-0 flex-1">
                  <Link href={`/employer/talent/${worker.id}`} className="block truncate text-sm font-medium text-fg hover:text-navy-800">{worker.firstName} {worker.lastName}</Link>
                  <span className="block text-xs text-fg-muted">{pluralize(shifts, "shift")} with you</span>
                </span>
                <Rating value={avgRating} />
              </li>
            ) : null)}
          </ul>
        )}
      </div>
    </Card>
  );
}
