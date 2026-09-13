import { Skeleton } from "@/components/ui/skeleton";

export function AdminAnalyticsSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading analytics">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-lg bg-surface p-5 shadow-card">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-[420px]" />
        <div className="space-y-6"><Skeleton className="h-[240px]" /><Skeleton className="h-[156px]" /></div>
      </div>
    </div>
  );
}
