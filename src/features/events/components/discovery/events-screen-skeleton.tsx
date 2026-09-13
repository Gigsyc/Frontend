import { EventCardSkeleton } from "@/components/common/event-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultsSkeleton } from "./event-results";

/** Suspense fallback for /events — the same bands the real board renders, in the same order. */
export function EventsScreenSkeleton() {
  return (
    <div className="bg-canvas pb-16" aria-busy="true" aria-label="Loading events">
      <div className="container-x space-y-8 py-8 lg:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-10 w-full lg:w-[360px]" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><EventCardSkeleton emphasis="hero" /></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-9 w-28 rounded-full" />)}
        </div>
        <ResultsSkeleton />
      </div>
    </div>
  );
}
