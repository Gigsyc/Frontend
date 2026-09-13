"use client";

import { Star } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Rating } from "@/components/ui/rating";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployers } from "@/features/employers";
import { formatDate, pluralize } from "@/lib/utils";
import type { Worker } from "@/types";

interface Props { worker: Worker; employerId: string }

/** Reviews are derived from rated work-history items — GigSyc has no separate review object. */
export function WorkerReviewsTab({ worker, employerId }: Props) {
  const employers = useEmployers();
  const names = useMemo(() => new Map(employers.data?.map((e) => [e.id, e.name]) ?? []), [employers.data]);

  const { rated, average, buckets } = useMemo(() => {
    const rated = worker.history.filter((h): h is typeof h & { rating: number } => typeof h.rating === "number").sort((a, b) => b.date.localeCompare(a.date));
    const average = rated.length ? rated.reduce((a, h) => a + h.rating, 0) / rated.length : 0;
    const buckets = [5, 4, 3, 2, 1].map((star) => ({ star, count: rated.filter((h) => Math.round(h.rating) === star).length }));
    return { rated, average, buckets };
  }, [worker.history]);

  if (rated.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description={`${worker.firstName} is rated after each completed shift. Their overall rating on GigSyc is ${worker.ratingCount ? `${worker.rating.toFixed(1)} from ${pluralize(worker.ratingCount, "review")}` : "not set yet"}.`}
        />
      </Card>
    );
  }

  const quotes = rated.filter((h) => h.feedback);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex flex-col items-start gap-1 sm:pr-6 sm:border-r sm:border-border">
            <p className="font-display text-[40px] font-semibold leading-none tracking-tight text-navy-900 tabular">{average.toFixed(1)}</p>
            <Rating value={average} showValue={false} size="md" />
            <p className="text-[13px] text-fg-muted">From {pluralize(rated.length, "rated shift")} · {worker.rating.toFixed(1)} overall on GigSyc ({worker.ratingCount})</p>
          </div>
          <ol className="space-y-2">
            {buckets.map((b) => (
              <li key={b.star} className="flex items-center gap-3 text-[13px]">
                <span className="w-12 shrink-0 text-fg-muted tabular">{b.star} star{b.star === 1 ? "" : "s"}</span>
                <Progress value={(b.count / rated.length) * 100} tone="amber" label={`${b.count} of ${rated.length} shifts rated ${b.star} stars`} className="flex-1" />
                <span className="w-6 shrink-0 text-right tabular text-fg">{b.count}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>What employers said</CardTitle></CardHeader>
        <CardContent className="pt-3">
          {quotes.length === 0 ? (
            <p className="text-sm text-fg-muted">Ratings so far came without written feedback.</p>
          ) : (
            <ul className="divide-y divide-border">
              {quotes.map((h) => (
                <li key={h.id} className="py-4 first:pt-0 last:pb-0">
                  <blockquote className="text-sm leading-6 text-fg">“{h.feedback}”</blockquote>
                  <footer className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-fg-muted">
                    <Rating value={h.rating} />
                    <span className="font-medium text-fg">
                      {employers.isPending ? <Skeleton className="inline-block h-3 w-28 align-middle" /> : names.get(h.employerId) ?? "GigSyc employer"}
                    </span>
                    {h.employerId === employerId ? <Badge tone="amber">You</Badge> : null}
                    <span>{h.title} · {formatDate(h.date)}</span>
                  </footer>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
