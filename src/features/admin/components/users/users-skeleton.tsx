import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export function UsersTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div aria-hidden className="divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="mt-2 h-3 w-52 max-w-full" />
          </div>
          <Skeleton className="hidden h-5 w-20 rounded-sm lg:block" />
          <Skeleton className="hidden h-5 w-16 rounded-sm lg:block" />
          <Skeleton className="hidden h-3.5 w-20 lg:block" />
          <Skeleton className="hidden h-3.5 w-24 lg:block" />
        </div>
      ))}
    </div>
  );
}

/** Route-level fallback while the URL filters resolve. */
export function UsersScreenSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Everyone with a GigSyc account: customers, professionals, organisers and staff." />
      <Skeleton className="h-10 w-full max-w-xl" />
      <Card className="overflow-hidden"><UsersTableSkeleton /></Card>
    </div>
  );
}
