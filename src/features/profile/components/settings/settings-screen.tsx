"use client";

import { ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useWorkerSession } from "@/features/session";
import { useWorker } from "@/features/workers";
import { AccountCard } from "./account-card";
import { DangerZoneCard } from "./danger-zone-card";
import { PayoutCard } from "./payout-card";
import { LanguageCard, NotificationsCard, PrivacyCard } from "./preferences-cards";
import { PrototypeCard } from "./prototype-card";
import { SettingsSkeleton } from "./settings-skeleton";

export function SettingsScreen() {
  const { workerId } = useWorkerSession();
  const { data: worker, isPending, isError, error, refetch, isRefetching } = useWorker(workerId);

  const header = <PageHeader title="Settings" description="Account, payouts and how GigSyc contacts you." backHref="/worker/profile" backLabel="My profile" />;

  if (isPending) return <div className="space-y-6">{header}<SettingsSkeleton /></div>;
  if (isError || !worker) {
    return (
      <div className="space-y-6">
        {header}
        <div className="rounded-lg bg-surface shadow-card"><ErrorState title="We couldn't load your settings" error={error} onRetry={() => refetch()} retrying={isRefetching} /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}
      <AccountCard worker={worker} />
      <PayoutCard />
      <NotificationsCard />
      <LanguageCard />
      <PrivacyCard />
      <PrototypeCard />
      <DangerZoneCard />
    </div>
  );
}
