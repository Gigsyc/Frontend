import { Skeleton } from "@/components/ui";

/** Mirrors the loaded layout: three stats, chart card, method card, one payout group. */
export function EarningsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading your earnings">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-lg bg-surface p-5 shadow-card">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-surface p-5 shadow-card">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-2 h-3 w-64 max-w-full" />
        <Skeleton className="mt-6 h-[140px]" />
        <div className="mt-2 flex justify-between">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-3 w-8" />)}</div>
      </div>
      <div className="flex items-center gap-4 rounded-lg bg-surface p-4 shadow-card sm:p-5">
        <Skeleton className="size-10" />
        <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-4 w-48" /></div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-16" />
        <div className="rounded-lg bg-surface shadow-card">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-8" />
              <div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-2/5" /></div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
