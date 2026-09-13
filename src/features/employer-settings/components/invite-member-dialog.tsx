"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { EMAIL_RE, INVITED_AVATAR_COLOR, TEAM_ROLE_HELP, type TeamMember, type TeamRole } from "../team";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEmails: string[];
  onInvite: (member: TeamMember) => void;
}

const INVITABLE: TeamRole[] = ["Admin", "Viewer"];

export function InviteMemberDialog({ open, onOpenChange, existingEmails, onInvite }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("Admin");
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const validate = (value: string) => {
    const v = value.trim().toLowerCase();
    if (!EMAIL_RE.test(v)) return "Enter a work email, e.g. name@yourcompany.rw";
    if (existingEmails.includes(v)) return "That person is already on the team.";
    return undefined;
  };

  const reset = () => { setEmail(""); setRole("Admin"); setError(undefined); setSubmitted(false); };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    const e = validate(email);
    setError(e);
    if (e) return;
    setSending(true);
    window.setTimeout(() => {
      const clean = email.trim().toLowerCase();
      onInvite({
        id: `tm_${Date.now().toString(36)}`,
        name: clean.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        role,
        jobTitle: "Pending",
        email: clean,
        status: "invited",
        lastActive: "Not yet joined",
        avatarColor: INVITED_AVATAR_COLOR,
      });
      setSending(false);
      onOpenChange(false);
      reset();
      toast.success(`Invite sent to ${clean}`, { description: `They'll join as ${role}. The link is valid for 7 days.` });
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (sending) return; onOpenChange(o); if (!o) reset(); }}>
      <DialogContent size="sm">
        <form onSubmit={submit} noValidate className="flex min-h-0 flex-col">
          <DialogHeader>
            <DialogTitle>Invite a colleague</DialogTitle>
            <DialogDescription>They get an email link to join your organisation on GigSyc.</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <Field label="Work email" required error={error}>
              {(p) => (
                <Input
                  {...p}
                  type="email"
                  inputMode="email"
                  autoFocus
                  placeholder="name@yourcompany.rw"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (submitted) setError(validate(e.target.value)); }}
                  onBlur={() => { if (submitted) setError(validate(email)); }}
                />
              )}
            </Field>
            <Field label="Role" hint={TEAM_ROLE_HELP[role]}>
              {(p) => (
                <Select {...p} value={role} onChange={(e) => setRole(e.target.value as TeamRole)}>
                  {INVITABLE.map((r) => <option key={r} value={r}>{r}</option>)}
                </Select>
              )}
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost" disabled={sending}>Cancel</Button></DialogClose>
            <Button type="submit" loading={sending}>Send invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
