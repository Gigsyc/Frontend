import { ShiftCardSkeleton } from "@/components/common/shift-card";
import { Skeleton } from "@/components/ui/skeleton";

/** Layout-matching placeholder for the whole Discover feed (Suspense fallback and first paint). */
export function DiscoverScreenSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-80 max-w-full" />
        <div className="flex gap-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}</div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <ShiftCardSkeleton key={i} />)}</div>
      </div>
    </div>
  );
}
