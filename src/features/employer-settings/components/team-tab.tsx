"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EMPLOYER_USERS } from "@/data/mocks/employers";
import { pluralize } from "@/lib/utils";
import { OWNER_AVATAR_COLOR, SAMPLE_COLLEAGUES, TEAM_ROLE_HELP, type TeamMember } from "../team";
import { InviteMemberDialog } from "./invite-member-dialog";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const stagger = (i: number) => ({ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: EASE, delay: Math.min(i, 7) * 0.03 } });

function ownerFor(employerId: string): TeamMember | undefined {
  const u = EMPLOYER_USERS.find((x) => x.employerId === employerId);
  return u ? { id: u.id, name: u.name, role: "Owner", jobTitle: u.role, email: u.email, status: "active", lastActive: "Now", avatarColor: OWNER_AVATAR_COLOR } : undefined;
}

function RoleBadge({ member }: { member: TeamMember }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Badge tone={member.role === "Owner" ? "navy" : "neutral"}>{member.role}</Badge>
      {member.status === "invited" ? <Badge tone="cyan">Invited</Badge> : null}
    </span>
  );
}

function RowMenu({ member, onRemove }: { member: TeamMember; onRemove: () => void }) {
  const isOwner = member.role === "Owner";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.name}`}><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {member.status === "invited" ? (
          <DropdownMenuItem onSelect={() => toast.success(`Invite re-sent to ${member.email}`)}>Resend invite</DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled={isOwner} onSelect={() => toast("Role changes are not part of the prototype.")}>Change role</DropdownMenuItem>
        )}
        <DropdownMenuItem destructive disabled={isOwner} onSelect={onRemove}>{member.status === "invited" ? "Cancel invite" : "Remove from team"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TeamTab({ employerId }: { employerId: string }) {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    const owner = ownerFor(employerId);
    return owner ? [owner, ...SAMPLE_COLLEAGUES] : SAMPLE_COLLEAGUES;
  });
  const [inviteOpen, setInviteOpen] = useState(false);
  /** Member whose removal (or invite cancellation) is awaiting confirmation. */
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const confirmRemove = () => {
    const m = removing;
    if (!m) return;
    setMembers((prev) => prev.filter((x) => x.id !== m.id));
    setRemoving(null);
    toast.success(m.status === "invited" ? `Invite to ${m.email} cancelled` : `${m.name} removed from the team`);
  };
  const cancellingInvite = removing?.status === "invited";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Team</CardTitle>
            <CardDescription>{pluralize(members.length, "person", "people")} can act for your organisation. Colleagues below the owner are sample data.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setInviteOpen(true)}><UserPlus /> Invite</Button>
        </CardHeader>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-medium text-fg-muted">
              <tr className="border-b border-border [&>th]:px-5 [&>th]:pb-2">
                <th scope="col">Member</th>
                <th scope="col">Role</th>
                <th scope="col">Last active</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <motion.tr key={m.id} {...stagger(i)} className="border-b border-border last:border-0 [&>td]:px-5 [&>td]:py-3">
                  <td>
                    <span className="flex items-center gap-3">
                      <Avatar name={m.name} size="sm" color={m.avatarColor} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-fg">{m.name}</span>
                        <span className="block truncate text-xs text-fg-muted">{m.jobTitle} · {m.email}</span>
                      </span>
                    </span>
                  </td>
                  <td><RoleBadge member={m} /></td>
                  <td className="whitespace-nowrap text-fg-muted">{m.lastActive}</td>
                  <td className="text-right"><RowMenu member={m} onRemove={() => setRemoving(m)} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 divide-y divide-border md:hidden">
          {members.map((m, i) => (
            <motion.li key={m.id} {...stagger(i)} className="flex min-h-[44px] items-center gap-3 px-4 py-3">
              <Avatar name={m.name} size="md" color={m.avatarColor} />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium text-fg">{m.name}</span>
                  <RoleBadge member={m} />
                </span>
                <span className="mt-0.5 block truncate text-xs text-fg-muted">{m.jobTitle} · {m.lastActive}</span>
              </span>
              <RowMenu member={m} onRemove={() => setRemoving(m)} />
            </motion.li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader><CardTitle>What each role can do</CardTitle></CardHeader>
        <dl className="grid gap-4 px-5 pb-5 pt-3 sm:grid-cols-3">
          {(Object.keys(TEAM_ROLE_HELP) as Array<keyof typeof TEAM_ROLE_HELP>).map((r) => (
            <div key={r}>
              <dt className="text-sm font-medium text-fg">{r}</dt>
              <dd className="mt-0.5 text-[13px] leading-5 text-fg-muted">{TEAM_ROLE_HELP[r]}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Dialog open={!!removing} onOpenChange={(o) => { if (!o) setRemoving(null); }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{cancellingInvite ? `Cancel the invite to ${removing?.email}?` : `Remove ${removing?.name} from the team?`}</DialogTitle>
            <DialogDescription>
              {cancellingInvite
                ? "The link they were sent stops working. You can invite them again any time."
                : "They lose access to Ikaze’s shifts, workers and invoices immediately. You can invite them again later."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Keep</Button></DialogClose>
            <Button variant="danger" onClick={confirmRemove}>{cancellingInvite ? "Cancel invite" : "Remove"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        existingEmails={members.map((m) => m.email.toLowerCase())}
        onInvite={(m) => setMembers((prev) => [...prev, m])}
      />
    </div>
  );
}
