import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Card, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

/** The four Overview panels share one frame so the two columns line up. */
export function Panel({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-baseline justify-between gap-3 px-5 pb-2 pt-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-navy-700 transition-colors hover:text-navy-900">
      {children}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="overflow-hidden" aria-hidden>
      <Skeleton className="mx-5 mt-5 h-5 w-40" />
      <div className="mt-3 divide-y divide-border">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3">
            <Skeleton className="size-10 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-5 w-16 rounded-sm" />
          </div>
        ))}
      </div>
    </Card>
  );
}
