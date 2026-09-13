import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

/** Matches the two-column profile layout: sticky identity card left, tabbed content right. */
export function WorkerProfileSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8" aria-busy="true">
      <PageHeader
        backHref="/employer/talent"
        backLabel="Talent"
        eyebrow="Worker profile"
        title={<Skeleton className="h-8 w-56" />}
        description={<Skeleton className="h-4 w-72" />}
      />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <Skeleton className="size-14 rounded-full lg:size-20" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-20" /></div>
            ))}
          </div>
          <Skeleton className="mt-4 h-16" />
          <div className="mt-5 hidden flex-col gap-2 lg:flex">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </Card>
        <div className="space-y-6">
          <div className="flex gap-1 border-b border-border">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="mb-2 h-7 w-24" />)}
          </div>
          <Card className="p-5"><Skeleton className="h-4 w-32" /><SkeletonText lines={3} className="mt-4" /></Card>
          <Card className="p-5"><Skeleton className="h-4 w-20" /><div className="mt-4 grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}</div></Card>
        </div>
      </div>
    </div>
  );
}
