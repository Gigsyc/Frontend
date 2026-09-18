import { Skeleton } from "@/components/ui";

export function SubmitEventSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading">
      <div className="flex items-start justify-between gap-4">
        <div><Skeleton className="h-4 w-16" /><Skeleton className="mt-3 h-8 w-56" /><Skeleton className="mt-2 h-4 w-72 max-w-full" /></div>
        <Skeleton className="h-10 w-20" />
      </div>
      <Skeleton className="h-8 w-full" />
      <div className="rounded-lg bg-surface p-5 shadow-card">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-11 w-full" />
        <Skeleton className="mt-6 h-4 w-20" />
        <Skeleton className="mt-3 h-11 w-full" />
        <Skeleton className="mt-8 h-4 w-24" />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="mt-8 h-28 w-full" />
      </div>
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}
