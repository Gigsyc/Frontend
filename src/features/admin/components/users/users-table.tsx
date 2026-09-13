"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, ExternalLink, MoreHorizontal, PauseCircle, PlayCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserStatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatTimeAgo } from "@/lib/utils";
import type { PlatformUser } from "@/types";
import { ACTION_LABEL, actionsFor, type UserAction } from "./user-actions";
import { ROLE_LABEL } from "./use-user-filters";

interface Props {
  users: PlatformUser[];
  onAction: (user: PlatformUser, action: UserAction) => void;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const rowIn = (i: number) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: EASE, delay: Math.min(i, 7) * 0.03 },
});

const ACTION_ICON: Record<UserAction, LucideIcon> = { approve: CheckCircle2, suspend: PauseCircle, reactivate: PlayCircle };

function RowMenu({ user, onAction }: { user: PlatformUser; onAction: Props["onAction"] }) {
  const actions = actionsFor(user.status);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`}><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((a) => {
          const Icon = ACTION_ICON[a];
          return (
            <DropdownMenuItem key={a} destructive={a === "suspend"} onSelect={() => onAction(user, a)}>
              <Icon /> {ACTION_LABEL[a]}
            </DropdownMenuItem>
          );
        })}
        {user.linkedWorkerId ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/employer/talent/${user.linkedWorkerId}`}><ExternalLink /> View linked profile</Link>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UsersTable({ users, onAction }: Props) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-fg-muted">
              <th scope="col" className="px-5 py-3 font-medium">User</th>
              <th scope="col" className="px-5 py-3 font-medium">Role</th>
              <th scope="col" className="px-5 py-3 font-medium">Status</th>
              <th scope="col" className="px-5 py-3 font-medium">Place</th>
              <th scope="col" className="px-5 py-3 font-medium">Joined</th>
              <th scope="col" className="px-5 py-3 font-medium">Last active</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Events</th>
              <th scope="col" className="px-3 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <motion.tr key={u.id} {...rowIn(i)} className="border-b border-border last:border-0 hover:bg-ink-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} color={u.avatarColor} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-fg">{u.name}</p>
                      <p className="truncate text-xs text-fg-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3"><Badge tone={u.role === "admin" ? "navy" : "outline"}>{ROLE_LABEL[u.role]}</Badge></td>
                <td className="px-5 py-3"><UserStatusBadge status={u.status} /></td>
                <td className="whitespace-nowrap px-5 py-3 text-fg-muted">{u.place}</td>
                <td className="whitespace-nowrap px-5 py-3 text-fg-muted tabular">{formatDate(u.joinedAt)}</td>
                <td className="whitespace-nowrap px-5 py-3 text-fg-muted">{formatTimeAgo(u.lastActiveAt)}</td>
                <td className="px-5 py-3 text-right tabular text-fg">{u.eventsAttended}</td>
                <td className="px-3 py-3 text-right"><RowMenu user={u} onAction={onAction} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border lg:hidden">
        {users.map((u, i) => (
          <motion.li key={u.id} {...rowIn(i)} className="flex items-start gap-3 p-4">
            <Avatar name={u.name} color={u.avatarColor} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium leading-5 text-fg">{u.name}</p>
              <p className="truncate text-[13px] text-fg-muted">{u.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={u.role === "admin" ? "navy" : "outline"}>{ROLE_LABEL[u.role]}</Badge>
                <UserStatusBadge status={u.status} />
              </div>
              <p className="mt-2 text-xs text-fg-subtle">
                {u.place} · joined <span className="tabular">{formatDate(u.joinedAt)}</span> · active {formatTimeAgo(u.lastActiveAt)} · <span className="tabular">{u.eventsAttended}</span> events
              </p>
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center"><RowMenu user={u} onAction={onAction} /></div>
          </motion.li>
        ))}
      </ul>
    </>
  );
}
