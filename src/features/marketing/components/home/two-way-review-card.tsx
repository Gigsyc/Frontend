"use client";

import { motion } from "motion/react";
import { RoleIcon } from "@/components/common/role-icon";
import { EmployerMark, WorkerAvatar } from "@/components/ui/avatar";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Rating } from "@/components/ui/rating";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerSession } from "@/features/session";
import { formatDate, shiftHours } from "@/lib/utils";
import { Star } from "lucide-react";
import { useTwoWayReview } from "../../hooks/use-two-way-review";

const frame = "rounded-lg bg-surface p-5 shadow-card sm:p-6";

function ReviewSkeleton() {
  return (
    <div className={frame} aria-busy>
      <div className="flex gap-3"><Skeleton className="size-10 rounded-md" /><div className="flex-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="mt-2 h-3 w-1/2" /></div></div>
      {[0, 1].map((i) => (
        <div key={i} className="mt-6 flex gap-3"><Skeleton className="size-8 rounded-full" /><div className="flex-1"><Skeleton className="h-3 w-40" /><Skeleton className="mt-2 h-3 w-full" /><Skeleton className="mt-1.5 h-3 w-2/3" /></div></div>
      ))}
    </div>
  );
}

/** A real completed booking, rated in both directions. */
export function TwoWayReviewCard() {
  const { workerId } = useWorkerSession();
  const { worker, review, isPending, isError, error, isRefetching, refetch } = useTwoWayReview(workerId);

  if (isPending) return <ReviewSkeleton />;
  if (isError) return <div className={frame}><ErrorState compact title="Couldn't load this review" error={error} onRetry={() => refetch()} retrying={isRefetching} /></div>;
  if (!review || !worker) {
    return <div className={frame}><EmptyState compact icon={Star} title="No completed shifts yet" description="Ratings appear here once a shift has been worked, approved and rated by both sides." /></div>;
  }

  const { booking, shift, employer } = review;
  const er = booking.employerRating!;
  const wr = booking.workerRating;
  const hours = shiftHours(shift.startTime, shift.endTime, shift.breakMinutes);
  const breakdown: Array<[string, number]> = [["Punctuality", er.punctuality], ["Professionalism", er.professionalism], ["Competence", er.competence]];

  return (
    <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className={frame} aria-label="Example of a two-way rating">
      <header className="flex items-start gap-3">
        <RoleIcon role={shift.role} />
        <div className="min-w-0">
          <p className="text-xs font-medium text-fg-muted">Completed shift</p>
          <h3 className="truncate font-sans text-[15px] font-semibold tracking-normal text-fg">{shift.title}</h3>
          <p className="mt-0.5 text-[13px] text-fg-muted">{employer.name} · {formatDate(shift.date)} · {hours}h</p>
        </div>
      </header>

      <div className="mt-5 divide-y divide-border">
        <div className="flex gap-3 pb-5">
          <EmployerMark employer={employer} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="text-sm"><span className="font-semibold text-fg">{employer.name}</span> <span className="text-fg-muted">rated {worker.firstName}</span></p>
              <Rating value={er.score} size="md" />
            </div>
            {er.note ? <blockquote className="mt-1.5 text-sm leading-6 text-fg">“{er.note}”</blockquote> : null}
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
              {breakdown.map(([label, v]) => <li key={label}>{label} <span className="font-semibold text-fg tabular">{v.toFixed(1)}</span></li>)}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 pt-5">
          <WorkerAvatar worker={worker} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="text-sm"><span className="font-semibold text-fg">{worker.firstName} {worker.lastName}</span> <span className="text-fg-muted">rated {employer.name.split(" ")[0]}</span></p>
              {wr ? <Rating value={wr.score} size="md" /> : <span className="text-xs text-fg-subtle">Not rated yet</span>}
            </div>
            {wr?.note ? <blockquote className="mt-1.5 text-sm leading-6 text-fg">“{wr.note}”</blockquote> : <p className="mt-1.5 text-sm text-fg-muted">Workers rate briefing, treatment and on-time payment.</p>}
          </div>
        </div>
      </div>

      {booking.approvedAt ? <p className="mt-5 border-t border-border pt-4 text-xs text-fg-muted">Hours approved {formatDate(booking.approvedAt)} · paid to mobile money within 48 hours</p> : null}
    </motion.article>
  );
}
