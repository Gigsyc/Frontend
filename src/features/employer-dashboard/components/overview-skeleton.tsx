import { Skeleton } from "@/components/ui/skeleton";

function RowSkeletons({ rows }: { rows: number }) {
  return (
    <div className="mt-3 divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3.5 px-5 py-3">
          <Skeleton className="size-10 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/5" /><Skeleton className="h-3 w-2/5" /></div>
          <Skeleton className="h-5 w-16 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

/** Mirrors the overview — hero, attention cards, four tiles, two columns — so nothing jumps when data lands. */
export function OverviewSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading your overview">
      <div className="overflow-hidden rounded-lg bg-surface shadow-card">
        <Skeleton className="aspect-video w-full rounded-none sm:aspect-[21/9]" />
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
          <div className="space-y-3"><Skeleton className="h-7 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-3/4" /></div>
          <div className="space-y-3"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-2.5 w-full rounded-full" /><Skeleton className="h-10 w-40 rounded-md" /></div>
        </div>
      </div>
      <div>
        <Skeleton className="mb-3 h-5 w-36" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[76px]" />)}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[118px]" />)}</div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg bg-surface pb-2 shadow-card"><Skeleton className="mx-5 mt-5 h-5 w-32" /><RowSkeletons rows={4} /></div>
          <div className="rounded-lg bg-surface pb-2 shadow-card"><Skeleton className="mx-5 mt-5 h-5 w-40" /><RowSkeletons rows={4} /></div>
        </div>
        <div className="flex flex-col gap-6"><Skeleton className="h-[300px]" /><Skeleton className="h-[220px]" /></div>
      </div>
    </div>
  );
}
