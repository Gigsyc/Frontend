"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BellOff } from "lucide-react";
import { NotificationRow } from "@/components/common/notification-bell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarkNotificationRead, useNotifications } from "@/features/notifications";
import { useStaggerOnce } from "@/lib/motion";

const SHOWN = 6;

export function RecentActivity({ employerId }: { employerId: string }) {
  const { data, isPending, isError, error, refetch, isRefetching } = useNotifications(employerId);
  const markRead = useMarkNotificationRead();
  const recent = data?.slice(0, SHOWN) ?? [];
  const stagger = useStaggerOnce(recent.length > 0);

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
          <EmptyState compact icon={BellOff} title="Quiet so far" description="Reviews from GigSyc, applications, check-ins and payments will appear here as they happen." />
        ) : (
          <ul className="flex flex-col gap-0.5">
            {recent.map((n, i) => (
              <motion.li key={n.id} {...stagger(i)}><NotificationRow n={n} compact onOpen={(x) => !x.read && markRead.mutate(x.id)} /></motion.li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
