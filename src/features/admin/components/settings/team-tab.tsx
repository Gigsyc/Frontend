"use client";

import { useMemo, useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { UserStatusBadge } from "@/components/ui/status-badge";
import { useAdminUsers } from "@/features/admin";
import { formatTimeAgo, pluralize } from "@/lib/utils";
import { InviteAdminDialog } from "./invite-admin-dialog";

function TeamSkeleton() {
  return (
    <div aria-hidden className="divide-y divide-border">
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1"><Skeleton className="h-4 w-40" /><Skeleton className="mt-2 h-3 w-52 max-w-full" /></div>
          <Skeleton className="hidden h-5 w-16 rounded-sm sm:block" />
          <Skeleton className="hidden h-3.5 w-24 sm:block" />
        </div>
      ))}
    </div>
  );
}

/** The GigSyc staff accounts. Read-only here — status changes live on /admin/users. */
export function TeamTab() {
  const users = useAdminUsers();
  const [inviteOpen, setInviteOpen] = useState(false);

  const admins = useMemo(() => (users.data ?? []).filter((u) => u.role === "admin"), [users.data]);
  const emails = useMemo(() => admins.map((a) => a.email.toLowerCase()), [admins]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Team</CardTitle>
          <CardDescription>
            {users.isPending ? "Who can open this console." : `${pluralize(admins.length, "person", "people")} with access to the admin console.`}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)}><UserPlus /> Invite admin</Button>
      </CardHeader>

      <div className="mt-3">
        {users.isPending ? (
          <TeamSkeleton />
        ) : users.isError ? (
          <ErrorState title="We couldn't load the team" error={users.error} onRetry={() => void users.refetch()} compact />
        ) : admins.length === 0 ? (
          <EmptyState
            compact
            icon={Users}
            title="No admins on record"
            description="Invite a colleague and they show up here once they accept."
            action={<Button variant="outline" onClick={() => setInviteOpen(true)}><UserPlus /> Invite admin</Button>}
          />
        ) : (
          <ul className="divide-y divide-border">
            {admins.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar name={u.name} color={u.avatarColor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">{u.name}</p>
                  <p className="truncate text-xs text-fg-muted">{u.email}</p>
                </div>
                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                  <Badge tone="navy">Admin</Badge>
                  <UserStatusBadge status={u.status} />
                </div>
                <p className="shrink-0 whitespace-nowrap text-xs text-fg-subtle">Active {formatTimeAgo(u.lastActiveAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <InviteAdminDialog open={inviteOpen} onOpenChange={setInviteOpen} existingEmails={emails} />
    </Card>
  );
}
