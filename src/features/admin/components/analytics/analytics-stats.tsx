import { Globe, Ticket, UserCheck, Users } from "lucide-react";
import { Stat } from "@/components/ui/stat";
import { formatNumber, pluralize } from "@/lib/utils";
import type { PlatformTotals } from "./use-platform-analytics";

/** Four tiles, no more. Each hint says what the number is counted from. */
export function AnalyticsStatTiles({ totals }: { totals: PlatformTotals }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Published events"
        value={formatNumber(totals.published)}
        icon={Globe}
        hint={totals.flagged > 0 ? `${pluralize(totals.flagged, "event")} with an open report.` : "None flagged in an open report."}
      />
      <Stat
        label="Total attendance"
        value={formatNumber(totals.attendance)}
        icon={Users}
        hint={`People registered across ${pluralize(totals.published, "published event")}.`}
      />
      <Stat
        label="Free to attend"
        value={`${totals.freeShare}%`}
        icon={Ticket}
        hint={`${totals.free} free, ${totals.paid} paid.`}
      />
      <Stat
        label="Active users"
        value={formatNumber(totals.activeUsers)}
        icon={UserCheck}
        hint={`Of ${pluralize(totals.totalUsers, "account")} on the platform.`}
      />
    </div>
  );
}
