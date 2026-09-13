"use client";

import Link from "next/link";
import { BellOff } from "lucide-react";
import { NotificationRow } from "@/components/common/notification-bell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarkNotificationRead, useNotifications } from "@/features/notifications";

export function RecentActivity({ employerId }: { employerId: string }) {
  const { data, isPending, isError, error, refetch, isRefetching } = useNotifications(employerId);
  const markRead = useMarkNotificationRead();
  const recent = data?.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent activity</CardTitle>
        <Button variant="ghost" size="sm" asChild><Link href="/employer/notifications">View all</Link></Button>
      </CardHeader>
      <div className="p-2 pt-3">
        {isPending ? (
          <div className="flex flex-col gap-1.5 p-1">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : isError ? (
          <ErrorState compact title="Couldn't load activity" error={error} onRetry={() => void refetch()} retrying={isRefetching} />
        ) : recent.length === 0 ? (
          <EmptyState compact icon={BellOff} title="Quiet so far" description="Applications, check-ins and payments will appear here as they happen." />
        ) : (
          <ul className="flex flex-col gap-0.5">
            {recent.map((n) => (
              <li key={n.id}><NotificationRow n={n} compact onOpen={(x) => !x.read && markRead.mutate(x.id)} /></li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
