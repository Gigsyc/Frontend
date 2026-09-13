"use client";

import { ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployer } from "@/features/employers";
import { OrganisationForm } from "./organisation-form";
import { VerificationCard } from "./verification-card";

export function OrganisationTab({ employerId }: { employerId: string }) {
  const { data: employer, isPending, isError, error, refetch, isRefetching } = useEmployer(employerId);

  if (isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]" aria-busy aria-label="Loading organisation">
        <Skeleton className="h-[560px]" />
        <Skeleton className="h-[260px] self-start" />
      </div>
    );
  }
  if (isError || !employer) {
    return (
      <div className="rounded-lg bg-surface shadow-card">
        <ErrorState title="We couldn't load your organisation" error={error} onRetry={() => void refetch()} retrying={isRefetching} />
      </div>
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <OrganisationForm key={employer.id} employer={employer} />
      <VerificationCard employer={employer} />
    </div>
  );
}
