import { Skeleton } from "@/components/ui";

/** Mirrors the loaded layout: hero, week strip, segmented control, one date group. */
export function ScheduleSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading your shifts">
      <Skeleton className="h-64 rounded-lg" />
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-[60px]" />)}
      </div>
      <Skeleton className="h-9 w-72 max-w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-24" />
        <div className="rounded-lg bg-surface shadow-card">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-12 space-y-1.5"><Skeleton className="mx-auto h-4 w-10" /><Skeleton className="mx-auto h-3 w-8" /></div>
              <div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
              <Skeleton className="hidden h-4 w-20 sm:block" />
              <Skeleton className="size-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
