"use client";

import { CalendarDays, Languages, MapPin, Send } from "lucide-react";
import { WorkerAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Rating } from "@/components/ui/rating";
import { VerifiedMark } from "@/components/ui/verified";
import { PoolToggleButton } from "@/features/talent-pool/components/pool-toggle-button";
import { cn, formatDate, pluralize } from "@/lib/utils";
import type { Worker } from "@/types";
import { useWorkerEmployerStats } from "./use-worker-employer-stats";

interface Props {
  worker: Worker;
  employerId: string;
  inPool: boolean;
  onInvite: () => void;
}

function StatCell({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dt className="text-xs font-medium text-fg-muted">{label}</dt>
      <dd className="text-sm text-fg">{children}</dd>
    </div>
  );
}

/** Identity, trust signals and what this employer already knows about the worker. Sticky on desktop. */
export function WorkerProfileCard({ worker, employerId, inPool, onInvite }: Props) {
  const mine = useWorkerEmployerStats(employerId, worker.id);
  const withYou: string[] = [];
  if (mine.completed) withYou.push(`${pluralize(mine.completed, "shift")} completed with you`);
  if (mine.upcoming) withYou.push(`${pluralize(mine.upcoming, "upcoming shift")} confirmed`);
  if (mine.pendingInvites) withYou.push(`${pluralize(mine.pendingInvites, "invite")} awaiting their reply`);
  if (mine.applied) withYou.push(`${pluralize(mine.applied, "application")} waiting for you`);

  return (
    <Card className="p-4 lg:sticky lg:top-24 lg:p-5">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start">
        <WorkerAvatar worker={worker} size="xl" className="hidden lg:inline-flex" />
        <WorkerAvatar worker={worker} size="lg" className="lg:hidden" />
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Desktop only — the card is sticky, so it has to say who it is once the PageHeader scrolls away. */}
          <div className="hidden lg:block">
            <p className="font-display text-base font-semibold leading-tight text-navy-900">{worker.firstName} {worker.lastName}</p>
            <p className="mt-1 text-[13px] leading-5 text-fg-muted">{worker.headline}</p>
          </div>
          <VerifiedMark verifications={worker.verifications} size="md" />
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-fg-muted [&_svg]:size-3.5 [&_svg]:text-fg-subtle lg:flex-col lg:gap-y-1.5">
            <li className="inline-flex items-center gap-1.5"><MapPin aria-hidden />{worker.district}</li>
            <li className="inline-flex items-center gap-1.5"><Languages aria-hidden />{worker.languages.join(", ")}</li>
            <li className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden />Member since {formatDate(worker.joinedAt)}</li>
          </ul>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-4 lg:mt-5 lg:pt-5">
        <StatCell label="Rating"><Rating value={worker.rating} count={worker.ratingCount} size="md" /></StatCell>
        <StatCell label="Reliability">
          <div className="flex items-center gap-2">
            <Progress value={worker.reliability} tone={worker.reliability >= 95 ? "success" : worker.reliability >= 85 ? "navy" : "amber"} label={`${worker.reliability}% reliability`} className="w-16" />
            <span className="tabular font-semibold">{worker.reliability}%</span>
          </div>
        </StatCell>
        <StatCell label="Completed shifts"><span className="tabular font-semibold">{worker.completedShifts}</span></StatCell>
        <StatCell label="No-shows">
          <span className={cn("tabular font-semibold", worker.noShows > 0 ? "text-danger-600" : "text-success-700")}>{worker.noShows}</span>
        </StatCell>
      </dl>

      <div className="mt-4 rounded-md bg-navy-50/60 p-3 text-[13px] leading-5 lg:mt-5">
        <p className="font-medium text-navy-900">With you</p>
        {mine.isPending ? (
          <p className="text-fg-muted">Checking your bookings…</p>
        ) : withYou.length ? (
          <ul className="mt-0.5 text-fg">{withYou.map((line) => <li key={line}>{line}</li>)}</ul>
        ) : (
          <p className="text-fg-muted">No shifts with you yet. Invite {worker.firstName} to a shift to get started.</p>
        )}
        {typeof mine.avgRating === "number" ? (
          <p className="mt-1 text-fg-muted">You rated them <span className="tabular font-medium text-fg">{mine.avgRating.toFixed(1)}</span> on average.</p>
        ) : null}
      </div>

      <div className="mt-5 hidden flex-col gap-2 lg:flex">
        <Button className="w-full" onClick={onInvite}><Send /> Invite to shift</Button>
        <PoolToggleButton employerId={employerId} worker={worker} inPool={inPool} size="md" labels="long" className="w-full" />
      </div>
    </Card>
  );
}

/** Thumb-reachable actions on small screens; the desktop card carries the same two buttons. */
export function WorkerProfileActionBar({ worker, employerId, inPool, onInvite }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 p-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <div className="mx-auto flex max-w-6xl gap-2">
        <PoolToggleButton employerId={employerId} worker={worker} inPool={inPool} size="lg" className="flex-1" />
        <Button size="lg" className="flex-1" onClick={onInvite}><Send /> Invite to shift</Button>
      </div>
    </div>
  );
}
