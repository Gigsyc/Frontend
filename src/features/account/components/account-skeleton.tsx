import { Skeleton } from "@/components/ui/skeleton";

/** Matches the account layout: title, tab row, then the profile card. */
export function AccountSkeleton() {
  return (
    <div className="bg-canvas pb-16">
      <div className="container-x space-y-6 py-8 lg:py-10" aria-busy="true" aria-label="Loading your account">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-4 border-b border-border pb-3">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-4 w-20" />)}
        </div>
        <Skeleton className="h-36 rounded-lg" />
        <Skeleton className="h-44 rounded-lg" />
      </div>
    </div>
  );
}
