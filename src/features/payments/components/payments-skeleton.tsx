import { Skeleton } from "@/components/ui/skeleton";

export function PaymentsSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading payments">
      <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[118px]" />)}</div>
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Skeleton className="h-[320px]" />
        <div className="flex flex-col gap-6"><Skeleton className="h-[150px]" /><Skeleton className="h-[260px]" /></div>
      </div>
    </div>
  );
}

export function InvoiceDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]" aria-busy aria-label="Loading invoice">
      <Skeleton className="h-[320px]" />
      <Skeleton className="h-[280px]" />
    </div>
  );
}
