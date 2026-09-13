import { Building2 } from "lucide-react";
import { EmployerMark } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployerVerifiedMark } from "@/components/ui/verified";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { Employer } from "@/types";

interface EmployerRowProps {
  employer?: Employer;
  isPending?: boolean;
  onRetry?: () => void;
  retrying?: boolean;
}

/** Who posted this: mark, name, verification, track record. Skeleton while loading, a plain line if we can't load it. */
export function EmployerRow({ employer, isPending, onRetry, retrying }: EmployerRowProps) {
  if (isPending) {
    return (
      <div className="flex items-center gap-3" aria-hidden>
        <Skeleton className="size-10 rounded-md" />
        <div><Skeleton className="h-4 w-44" /><Skeleton className="mt-1.5 h-3 w-28" /></div>
      </div>
    );
  }
  if (!employer) {
    return (
      <div role="alert" className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-ink-100 text-fg-subtle">
          <Building2 className="size-5" aria-hidden />
        </span>
        <p className="text-[13px] text-fg-muted">
          Employer details unavailable.{" "}
          {onRetry ? <Button variant="link" className="text-[13px]" onClick={onRetry} loading={retrying}>Try again</Button> : null}
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <EmployerMark employer={employer} size="md" />
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[15px] font-semibold text-fg">
          {employer.name}
          {employer.verified ? <EmployerVerifiedMark /> : null}
        </p>
        <p className="text-[13px] text-fg-muted tabular">{formatNumber(employer.stats.shiftsPosted)} shifts posted · {formatPercent(employer.stats.fillRate)} fill rate</p>
      </div>
    </div>
  );
}

export function EmployerAboutCard({ employer }: { employer: Employer }) {
  const stats = [
    { label: "Shifts posted", value: formatNumber(employer.stats.shiftsPosted) },
    { label: "Workers engaged", value: formatNumber(employer.stats.workersEngaged) },
    { label: "Avg. rating given", value: employer.stats.avgRatingGiven.toFixed(1) },
  ];
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <EmployerMark employer={employer} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">About {employer.name}</h2>
          <p className="mt-0.5 text-[13px] text-fg-muted">{employer.tagline}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-fg">{employer.about}</p>
      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-xs text-fg-muted">{s.label}</dt>
            <dd className="mt-0.5 font-display text-lg font-semibold leading-none text-navy-900 tabular">{s.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
