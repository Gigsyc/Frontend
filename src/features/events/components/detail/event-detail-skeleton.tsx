import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

/** Mirrors the real page: back link, hero, title block, then the two-column body. */
export function EventDetailSkeleton() {
  return (
    <div className="bg-canvas pb-16">
      <div className="container-x space-y-8 py-6 sm:py-8" aria-busy="true" aria-label="Loading event">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="aspect-video w-full rounded-lg lg:aspect-[21/9]" />

        <div className="max-w-3xl space-y-3">
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <div className="flex flex-wrap gap-3 pt-1">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-3.5 w-28" />)}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <SkeletonText lines={3} />
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
            <div className="space-y-4 rounded-lg bg-surface p-4 shadow-card sm:p-5">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i}><Skeleton className="h-3 w-16" /><Skeleton className="mt-2 h-4 w-28" /></div>
                ))}
              </div>
              <Skeleton className="h-9 w-40" />
            </div>
            <div className="space-y-3 rounded-lg bg-surface p-4 shadow-card sm:p-5">
              <Skeleton className="h-4 w-32" />
              <SkeletonText lines={3} />
            </div>
          </div>

          <div className="hidden space-y-4 rounded-lg bg-surface p-5 shadow-card lg:block">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-2"><Skeleton className="h-11" /><Skeleton className="h-11" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
