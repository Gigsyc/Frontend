"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useAdminUsers } from "@/features/admin";
import { pluralize } from "@/lib/utils";
import type { PlatformUser } from "@/types";
import type { UserAction } from "./user-actions";
import { UserStatusDialog } from "./user-status-dialog";
import { hasUserFilters, useUserFilters } from "./use-user-filters";
import { UsersTable } from "./users-table";
import { UsersTableSkeleton } from "./users-skeleton";
import { UsersToolbar } from "./users-toolbar";

function matches(user: PlatformUser, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
}

/** /admin/users — every account on the platform, and the status changes staff can make. */
export function UsersScreen() {
  const users = useAdminUsers();
  const { state, update, clear } = useUserFilters();
  const [target, setTarget] = useState<{ user: PlatformUser; action: UserAction } | null>(null);

  const all = useMemo(() => users.data ?? [], [users.data]);
  const counts = useMemo(
    () => ({
      total: all.length,
      active: all.filter((u) => u.status === "active").length,
      pending: all.filter((u) => u.status === "pending").length,
      suspended: all.filter((u) => u.status === "suspended").length,
    }),
    [all],
  );

  const rows = useMemo(
    () => all.filter((u) => matches(u, state.query) && (state.role === "all" || u.role === state.role) && (state.status === "all" || u.status === state.status)),
    [all, state],
  );

  const filtered = hasUserFilters(state);

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Everyone with a GigSyc account: customers, professionals, organisers and staff." />

      <UsersToolbar state={state} onChange={update} />

      {users.isPending ? (
        <Card className="overflow-hidden"><UsersTableSkeleton /></Card>
      ) : users.isError ? (
        <Card><ErrorState title="We couldn't load users" error={users.error} onRetry={() => void users.refetch()} /></Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-fg-muted">
            <span><span className="font-medium tabular text-fg">{counts.total}</span> total</span>
            <span><span className="font-medium tabular text-fg">{counts.active}</span> active</span>
            <span><span className="font-medium tabular text-fg">{counts.pending}</span> pending</span>
            <span><span className="font-medium tabular text-fg">{counts.suspended}</span> suspended</span>
            {filtered ? <span className="text-fg-subtle">· showing {pluralize(rows.length, "match", "matches")}</span> : null}
          </div>

          <Card className="overflow-hidden">
            {rows.length === 0 ? (
              filtered ? (
                <EmptyState
                  icon={Users}
                  title="No one matches those filters"
                  description="Try a different role or status, or search for part of a name or email address."
                  action={<Button variant="outline" onClick={clear}>Clear filters</Button>}
                />
              ) : (
                <EmptyState
                  icon={Users}
                  title="No accounts yet"
                  description="Accounts appear here as soon as someone signs up."
                />
              )
            ) : (
              <UsersTable users={rows} onAction={(user, action) => setTarget({ user, action })} />
            )}
          </Card>
        </>
      )}

      <UserStatusDialog target={target} onClose={() => setTarget(null)} />
    </div>
  );
}
