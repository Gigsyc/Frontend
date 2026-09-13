"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button, ErrorState, PageHeader } from "@/components/ui";
import { useWorkerSession } from "@/features/session";
import type { PayoutItem } from "../types";
import { useWorkerEarnings } from "../use-worker-earnings";
import { EarningsSkeleton } from "./earnings-skeleton";
import { EarningsStats } from "./earnings-stats";
import { MonthlyChart } from "./monthly-chart";
import { PayoutDetailDialog } from "./payout-detail-dialog";
import { PayoutList } from "./payout-list";
import { PayoutMethodCard } from "./payout-method-card";

/** /worker/earnings — what's been paid, what's on its way, and where it goes. */
export function EarningsScreen() {
  const { workerId } = useWorkerSession();
  const earnings = useWorkerEarnings(workerId);
  const [selected, setSelected] = useState<PayoutItem | null>(null);

  const downloadStatement = () =>
    toast("Statements aren't in the prototype yet", { description: "In the real app this downloads a PDF of every payout for the period." });

  const header = (
    <PageHeader
      title="Earnings"
      description="Paid to your mobile money after each approved shift."
      actions={
        <Button variant="outline" size="sm" onClick={downloadStatement}>
          <Download /> Download statement
        </Button>
      }
    />
  );

  if (earnings.isPending) {
    return (
      <div className="space-y-6">
        {header}
        <EarningsSkeleton />
      </div>
    );
  }

  if (earnings.isError || !earnings.data) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState title="We couldn't load your earnings" error={earnings.error} onRetry={earnings.refetch} retrying={earnings.isRefetching} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}
      <EarningsStats earnings={earnings.data} />
      <MonthlyChart months={earnings.data.months} />
      <PayoutMethodCard />
      <PayoutList earnings={earnings.data} onOpen={setSelected} />
      <p className="px-1 text-[11px] leading-4 text-fg-subtle">
        GigSyc reports earnings to you; you&apos;re responsible for declaring income to Rwanda Revenue Authority.
      </p>
      <PayoutDetailDialog item={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
