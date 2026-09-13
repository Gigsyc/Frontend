import { Skeleton } from "@/components/ui";

export function JobDetailSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading shift">
      <div className="space-y-4">
        <Skeleton className="h-4 w-12" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1"><Skeleton className="h-3.5 w-48" /><Skeleton className="mt-2 h-8 w-3/4 max-w-xl" /><Skeleton className="mt-3 h-4 w-72" /></div>
          <div className="flex gap-2"><Skeleton className="h-10 w-20" /><Skeleton className="h-10 w-28" /><Skeleton className="h-10 w-32" /></div>
        </div>
      </div>
      <div className="rounded-lg bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex-1"><Skeleton className="h-3 w-40" /><Skeleton className="mt-2 h-2 w-full" /></div>
          <div className="grid grid-cols-4 gap-6">{[0, 1, 2, 3].map((i) => <div key={i}><Skeleton className="h-6 w-8" /><Skeleton className="mt-1.5 h-3 w-14" /></div>)}</div>
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
      <div className="flex gap-4 border-b border-border pb-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-5 w-20" />)}</div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2"><Skeleton className="h-56" /><Skeleton className="h-64" /></div>
        <div className="space-y-4"><Skeleton className="aspect-video w-full" /><Skeleton className="h-24" /></div>
      </div>
    </div>
  );
}
