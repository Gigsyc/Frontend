import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OnboardingSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading">
      <div><Skeleton className="h-7 w-48" /><Skeleton className="mt-2 h-3.5 w-72" /></div>
      <Card>
        <div className="border-b border-border px-4 py-4 sm:px-6">
          <div className="hidden items-center gap-3 md:flex">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-7 flex-1" />)}</div>
          <div className="md:hidden"><Skeleton className="h-4 w-32" /><Skeleton className="mt-3 h-1 w-full rounded-full" /></div>
        </div>
        <div className="flex flex-col gap-5 px-4 py-5 sm:px-6">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3.5 w-80" />
          <div className="grid gap-5 sm:grid-cols-2">{[0, 1].map((i) => <div key={i}><Skeleton className="h-3.5 w-20" /><Skeleton className="mt-2 h-10 w-full" /></div>)}</div>
          {[0, 1].map((i) => <div key={i}><Skeleton className="h-3.5 w-28" /><Skeleton className="mt-2 h-10 w-full" /></div>)}
          <div className="flex gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}</div>
        </div>
        <div className="flex justify-between border-t border-border px-4 py-4 sm:px-6"><Skeleton className="h-10 w-20" /><Skeleton className="h-10 w-28" /></div>
      </Card>
    </div>
  );
}
