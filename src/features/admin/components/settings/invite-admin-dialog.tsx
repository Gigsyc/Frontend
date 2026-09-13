"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lowercased addresses already on the operations team. */
  existingEmails: string[];
}

export function InviteAdminDialog({ open, onOpenChange, existingEmails }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const validate = (value: string) => {
    const v = value.trim().toLowerCase();
    if (!EMAIL_RE.test(v)) return "Enter a work email, e.g. name@gigsyc.rw";
    if (existingEmails.includes(v)) return "That person is already on the operations team.";
    return undefined;
  };

  const reset = () => { setEmail(""); setError(undefined); setSubmitted(false); };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    const problem = validate(email);
    setError(problem);
    if (problem) return;
    setSending(true);
    window.setTimeout(() => {
      const clean = email.trim().toLowerCase();
      setSending(false);
      onOpenChange(false);
      reset();
      toast.success(`Invite sent to ${clean}`, { description: "They join with full access to the admin console. The link is valid for 7 days." });
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (sending) return; onOpenChange(o); if (!o) reset(); }}>
      <DialogContent size="sm">
        <form onSubmit={submit} noValidate className="flex min-h-0 flex-col">
          <DialogHeader>
            <DialogTitle>Invite an admin</DialogTitle>
            <DialogDescription>Admins can publish events, verify partners and close reports.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field label="Work email" required error={error}>
              {(p) => (
                <Input
                  {...p}
                  type="email"
                  inputMode="email"
                  autoFocus
                  placeholder="name@gigsyc.rw"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (submitted) setError(validate(e.target.value)); }}
                  onBlur={() => { if (submitted) setError(validate(email)); }}
                />
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
