import { Skeleton } from "@/components/ui/skeleton";

/** Matches the shell: slim bar, heading pair, one field and a grid of tiles. */
export function PartnerOnboardingSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas" aria-busy>
      <div className="h-16 shrink-0" />
      <div className="flex flex-1 justify-center px-5 sm:px-8">
        <div className="w-full max-w-xl">
          <Skeleton className="h-1 w-full rounded-full" />
          <Skeleton className="mt-8 h-8 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <Skeleton className="mt-8 h-11 w-full rounded-md" />
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[72px] rounded-lg" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
