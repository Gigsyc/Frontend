import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the overview grid so the page doesn't jump when data lands. */
export function OverviewSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading overview">
      <div>
        <Skeleton className="mb-3 h-5 w-36" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[76px]" />)}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[118px]" />)}</div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-[380px]" />
        <div className="flex flex-col gap-6"><Skeleton className="h-[260px]" /><Skeleton className="h-[200px]" /></div>
      </div>
    </div>
  );
}
