"use client";

import Link from "next/link";
import { Bell, CalendarClock, CheckCircle2, CreditCard, Sparkles, Star, UserPlus, Info, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/features/notifications";
import { formatTimeAgo, cn } from "@/lib/utils";
import type { AppNotification, NotificationKind } from "@/types";

export const NOTIFICATION_ICON: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  shift_match: Sparkles,
  booking_confirmed: CheckCircle2,
  reminder: CalendarClock,
  payment: CreditCard,
  rating: Star,
  system: Info,
  application: UserPlus,
  attendance: ClipboardCheck,
};

export function NotificationRow({ n, onOpen, compact }: { n: AppNotification; onOpen?: (n: AppNotification) => void; compact?: boolean }) {
  const Icon = NOTIFICATION_ICON[n.kind];
  const inner = (
    <>
      <span className={cn("mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md", n.read ? "bg-ink-100 text-fg-muted" : "bg-navy-50 text-navy-800")}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm", n.read ? "text-fg" : "font-semibold text-fg")}>{n.title}</span>
        <span className={cn("block text-fg-muted", compact ? "line-clamp-1 text-xs" : "text-[13px] leading-5")}>{n.body}</span>
        <span className="mt-0.5 block text-xs text-fg-subtle">{formatTimeAgo(n.createdAt)}</span>
      </span>
      {!n.read ? <span className="mt-2 size-2 shrink-0 rounded-full bg-amber-500" aria-label="Unread" /> : null}
    </>
  );
  const cls = cn("flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-ink-50", !n.read && "bg-navy-50/40");
  return n.href ? (
    <Link href={n.href} className={cls} onClick={() => onOpen?.(n)}>{inner}</Link>
  ) : (
    <button type="button" className={cls} onClick={() => onOpen?.(n)}>{inner}</button>
  );
}

export function NotificationBell({ recipientId, allHref, onDark }: { recipientId: string; allHref: string; onDark?: boolean }) {
  const { data, isPending } = useNotifications(recipientId);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead(recipientId);
  const unread = data?.filter((n) => !n.read).length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={onDark ? "on-dark" : "ghost"} size="icon" className={cn("relative", onDark && "border-0 bg-transparent hover:bg-white/10")} aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}>
          <Bell />
          {unread ? <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-amber-500 px-1 text-center text-[10px] font-semibold leading-4 text-navy-900 tabular">{unread}</span> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unread ? (
            <button type="button" className="text-xs font-medium text-navy-700 hover:underline" onClick={() => markAll.mutate()} disabled={markAll.isPending}>Mark all read</button>
          ) : null}
        </div>
        <div className="max-h-[420px] overflow-y-auto border-t border-border p-1.5">
          {isPending ? (
            <div className="flex flex-col gap-2 p-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : !data?.length ? (
            <p className="px-4 py-8 text-center text-sm text-fg-muted">You&apos;re all caught up.</p>
          ) : (
            data.slice(0, 6).map((n) => <NotificationRow key={n.id} n={n} compact onOpen={(x) => !x.read && markRead.mutate(x.id)} />)
          )}
        </div>
        <div className="border-t border-border p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild><Link href={allHref}>View all notifications</Link></Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
