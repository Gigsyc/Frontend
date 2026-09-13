import { format } from "date-fns";
import { Clock, Landmark, Wallet } from "lucide-react";
import { Stat } from "@/components/ui";
import { formatRwf, pluralize } from "@/lib/utils";
import type { WorkerEarnings } from "../types";

/** Three KPI tiles: this month, on its way, all time. */
export function EarningsStats({ earnings }: { earnings: WorkerEarnings }) {
  const month = format(new Date(), "MMMM");
  const paidThisMonthCount = earnings.paid.filter((it) => (it.payout.paidAt ?? it.payout.scheduledFor).startsWith(format(new Date(), "yyyy-MM"))).length;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat
        label={`Paid in ${month}`}
        icon={Wallet}
        value={formatRwf(earnings.paidThisMonth)}
        hint={paidThisMonthCount ? `${pluralize(paidThisMonthCount, "payout")} to MoMo this month` : `No payouts yet in ${month}`}
      />
      <Stat
        label="On its way"
        icon={Clock}
        value={formatRwf(earnings.pending)}
        hint={earnings.pendingCount ? `${pluralize(earnings.pendingCount, "shift")} awaiting approval or processing` : "Nothing waiting on approval"}
      />
      <Stat
        label="Lifetime"
        icon={Landmark}
        value={formatRwf(earnings.lifetime, { compact: earnings.lifetime >= 1_000_000 })}
        hint={`${pluralize(earnings.paidCount, "paid shift")} through GigSyc`}
      />
    </div>
  );
}
