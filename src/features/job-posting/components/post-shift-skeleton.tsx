import { Skeleton } from "@/components/ui";

export function PostShiftSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading">
      <div className="flex items-start justify-between gap-4">
        <div><Skeleton className="h-4 w-16" /><Skeleton className="mt-3 h-8 w-48" /></div>
        <Skeleton className="h-10 w-20" />
      </div>
      <Skeleton className="h-8 w-full" />
      <div className="rounded-lg bg-surface p-5 shadow-card">
        <Skeleton className="h-4 w-24" />
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="mt-8 h-10 w-full" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2"><Skeleton className="h-11 w-44" /><Skeleton className="h-10" /></div>
      </div>
    </div>
  );
}
