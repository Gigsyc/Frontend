import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors ProfileHeader + tabs + one content card so the page doesn't jump when data lands. */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading profile">
      <Card className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="size-16 rounded-full sm:size-20" />
          <div className="flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3.5 w-64" />
            <Skeleton className="mt-2 h-3 w-48" />
            <Skeleton className="mt-1.5 h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-px rounded-md bg-canvas p-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2"><Skeleton className="h-3 w-14" /><Skeleton className="h-6 w-12" /></div>
          ))}
        </div>
        <Skeleton className="mt-5 h-3.5 w-28" />
        <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
        <Skeleton className="mt-3 h-3.5 w-56" />
      </Card>
      <div className="flex gap-1 border-b border-border">
        {[24, 28, 26, 20].map((w, i) => <Skeleton key={i} className="my-3 h-4" style={{ width: `${w * 4}px` }} />)}
      </div>
      <Card className="p-4 sm:p-5"><Skeleton className="h-4 w-24" /><Skeleton className="mt-3 h-3.5 w-full" /><Skeleton className="mt-2 h-3.5 w-11/12" /><Skeleton className="mt-2 h-3.5 w-2/3" /></Card>
      <Card className="p-4 sm:p-5">
        <Skeleton className="h-4 w-20" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      </Card>
    </div>
  );
}
