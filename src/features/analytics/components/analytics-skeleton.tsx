import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading analytics">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[118px]" />)}</div>
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]"><Skeleton className="h-[300px]" /><Skeleton className="h-[300px]" /></div>
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]"><Skeleton className="h-[320px]" /><Skeleton className="h-[320px]" /></div>
    </div>
  );
}
