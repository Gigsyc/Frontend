"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { WorkerAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Skeleton } from "@/components/ui/skeleton";
import { VerifiedMark } from "@/components/ui/verified";
import { ROLES } from "@/data/roles";
import { cn } from "@/lib/utils";
import type { Worker } from "@/types";

interface WorkerCardProps {
  worker: Worker;
  href: string;
  /** Slot for the primary action (Invite, Add to pool). Rendered outside the link. */
  action?: React.ReactNode;
  /** Match explanation, e.g. from rankWorkersForShift */
  reasons?: string[];
  inPool?: boolean;
  className?: string;
}

/** Employer-facing worker card: identity → trust signals → skills. */
export function WorkerCard({ worker, href, action, reasons, inPool, className }: WorkerCardProps) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-lg bg-surface p-4 shadow-card transition-shadow hover:shadow-raised", className)}>
      <div className="flex items-start gap-3">
        <Link href={href} className="shrink-0 rounded-full"><WorkerAvatar worker={worker} size="lg" /></Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Link href={href} className="font-sans text-[15px] font-semibold text-fg hover:text-navy-800">{worker.firstName} {worker.lastName}</Link>
            <VerifiedMark verifications={worker.verifications} />
            {inPool ? <Badge tone="amber"><Star className="fill-current" /> Talent pool</Badge> : null}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[13px] text-fg-muted">{worker.headline}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
            <Rating value={worker.rating} count={worker.ratingCount} />
            <span className="tabular"><span className="font-semibold text-fg">{worker.reliability}%</span> reliable</span>
            <span className="tabular"><span className="font-semibold text-fg">{worker.completedShifts}</span> shifts</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{worker.district}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {worker.skills.slice(0, 4).map((s) => <Badge key={s} tone="outline">{ROLES[s].short}</Badge>)}
        {worker.skills.length > 4 ? <Badge tone="outline">+{worker.skills.length - 4}</Badge> : null}
      </div>
      {reasons?.length ? (
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-success-700">
          {reasons.slice(0, 3).map((r) => <li key={r} className="before:mr-1 before:content-['✓']">{r}</li>)}
        </ul>
      ) : null}
      {action ? <div className="flex items-center gap-2 border-t border-border pt-3">{action}</div> : null}
    </div>
  );
}

export function WorkerCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-surface p-4 shadow-card" aria-hidden>
      <div className="flex gap-3">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex-1"><Skeleton className="h-4 w-40" /><Skeleton className="mt-2 h-3 w-56" /><Skeleton className="mt-2 h-3 w-48" /></div>
      </div>
      <div className="flex gap-1.5"><Skeleton className="h-5 w-16" /><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-14" /></div>
    </div>
  );
}
