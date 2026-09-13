import { WorkerCardSkeleton } from "@/components/common/worker-card";
import { Skeleton } from "@/components/ui/skeleton";

/** Two-column card grid placeholder that matches the real results grid. */
export function WorkerGridSkeleton({ count = 6, withToolbar = false }: { count?: number; withToolbar?: boolean }) {
  return (
    <div className="space-y-5" aria-busy="true">
      {withToolbar ? (
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-44" />
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: count }, (_, i) => <WorkerCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
