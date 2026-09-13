import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DestinationsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Card aria-hidden>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="size-10 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-56 max-w-full" />
            </div>
            <Skeleton className="hidden h-3.5 w-28 md:block" />
            <Skeleton className="hidden h-3.5 w-16 md:block" />
            <Skeleton className="h-6 w-10 rounded-full" />
            <Skeleton className="h-6 w-10 rounded-full" />
            <Skeleton className="hidden h-8 w-16 rounded-md md:block" />
          </div>
        ))}
      </div>
    </Card>
  );
}
