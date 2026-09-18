import { Skeleton } from "@/components/ui";

/** Mirrors the detail layout: back link, wide cover, header, callout, then two columns. */
export function OrganizerEventDetailSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading event">
      <div className="space-y-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="aspect-[21/9] w-full" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1"><Skeleton className="h-8 w-3/4 max-w-xl" /><Skeleton className="mt-3 h-4 w-2/3 max-w-md" /><Skeleton className="mt-3 h-4 w-96 max-w-full" /></div>
          <div className="flex gap-2"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-36" /></div>
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div><Skeleton className="h-6 w-20" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-2 h-4 w-11/12" /><Skeleton className="mt-2 h-4 w-2/3" /></div>
          <div><Skeleton className="h-6 w-36" /><div className="mt-3 grid gap-2.5 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-5 w-full" />)}</div></div>
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
