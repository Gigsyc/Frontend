import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading settings">
      {[3, 4, 4].map((rows, i) => (
        <Card key={i} className="p-4 sm:p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-3.5 w-64" />
          <div className="mt-4 divide-y divide-border">
            {Array.from({ length: rows }, (_, r) => (
              <div key={r} className="flex items-center justify-between py-3">
                <div><Skeleton className="h-3.5 w-36" /><Skeleton className="mt-1.5 h-3 w-52" /></div>
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
