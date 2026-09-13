import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

/** Matches the detail layout: header, photo, employer row, facts card, brief card. */
export function ShiftDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading shift">
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-7 w-4/5" />
        <SkeletonText lines={2} className="max-w-xl" />
      </div>
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-md" />
        <div><Skeleton className="h-4 w-44" /><Skeleton className="mt-1.5 h-3 w-28" /></div>
      </div>
      <div className="space-y-5 rounded-lg bg-surface p-4 shadow-card sm:p-5">
        <div><Skeleton className="h-3 w-24" /><Skeleton className="mt-2 h-8 w-40" /></div>
        <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }, (_, i) => <div key={i}><Skeleton className="h-3 w-16" /><Skeleton className="mt-2 h-4 w-28" /></div>)}</div>
        <Skeleton className="h-7 w-full" />
      </div>
      <div className="space-y-4 rounded-lg bg-surface p-4 shadow-card sm:p-5">
        <Skeleton className="h-4 w-32" />
        <SkeletonText lines={4} />
      </div>
    </div>
  );
}
