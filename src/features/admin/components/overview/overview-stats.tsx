import { CalendarRange, Globe, Handshake, Users } from "lucide-react";
import { Skeleton, Stat } from "@/components/ui";
import { formatNumber, pluralize } from "@/lib/utils";
import type { OverviewStats } from "../../hooks/use-admin-overview";

/** Four tiles, no more. Each hint says what the number does not include. */
export function OverviewStatTiles({ stats }: { stats: OverviewStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Published events"
        value={formatNumber(stats.liveEvents)}
        icon={Globe}
        hint="Live on the public site right now."
      />
      <Stat
        label="Events this month"
        value={formatNumber(stats.thisMonth)}
        icon={CalendarRange}
        hint={`Taking place in ${stats.monthName}, finished ones included.`}
      />
      <Stat
        label="Active users"
        value={formatNumber(stats.activeUsers)}
        icon={Users}
        hint={stats.pendingUsers > 0 ? `${pluralize(stats.pendingUsers, "account")} still pending.` : "Nobody waiting on approval."}
      />
      <Stat
        label="Partners"
        value={formatNumber(stats.partners)}
        icon={Handshake}
        hint={stats.unverifiedPartners > 0 ? `${stats.unverifiedPartners} not verified yet.` : "All verified."}
      />
    </div>
  );
}

export function OverviewStatTilesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg bg-surface p-5 shadow-card">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}
