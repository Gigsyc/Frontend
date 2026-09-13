"use client";

import { BellOff, CheckCheck } from "lucide-react";
import { NotificationRow } from "@/components/common/notification-bell";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/tabs";
import { useState } from "react";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../queries";

/** Shared by /employer/notifications and /worker/notifications. */
export function NotificationsScreen({ recipientId }: { recipientId: string }) {
  const { data, isPending, isError, error, refetch, isRefetching } = useNotifications(recipientId);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead(recipientId);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unread = data?.filter((n) => !n.read) ?? [];
  const shown = filter === "unread" ? unread : data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Matches, confirmations, reminders and payments."
        actions={unread.length ? <Button variant="outline" size="sm" onClick={() => markAll.mutate()} loading={markAll.isPending}><CheckCheck /> Mark all as read</Button> : null}
      >
        <Segmented ariaLabel="Filter notifications" value={filter} onChange={setFilter} options={[{ value: "all", label: "All", count: data?.length }, { value: "unread", label: "Unread", count: unread.length }]} />
      </PageHeader>

      <div className="rounded-lg bg-surface shadow-card">
        {isPending ? (
          <div className="flex flex-col gap-1 p-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} retrying={isRefetching} />
        ) : shown.length === 0 ? (
          <EmptyState icon={BellOff} title={filter === "unread" ? "Nothing unread" : "No notifications yet"} description={filter === "unread" ? "You've read everything. New matches and updates will appear here." : "When shifts match your profile or something changes on a booking, you'll hear about it here."} />
        ) : (
          <ul className="divide-y divide-border p-1.5">
            {shown.map((n) => (
              <li key={n.id}><NotificationRow n={n} onOpen={(x) => !x.read && markRead.mutate(x.id)} /></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
