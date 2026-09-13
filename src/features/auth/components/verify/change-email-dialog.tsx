"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/utils";
import { authService } from "../../auth-service";
import { useAuth } from "../../auth-provider";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const errorFor = (value: string) => (EMAIL.test(value.trim()) ? undefined : "Enter an email address, like you@example.rw.");

interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
  /** Fired once the address is saved, so the screen can clear the half-typed code. */
  onChanged: () => void;
}

/**
 * One field. The address on the account is the address the code goes to, so saving a
 * new one resets the code. The form is only mounted while the dialog is open, which is
 * what keeps a half-typed correction from surviving until next time.
 */
export function ChangeEmailDialog({ open, onOpenChange, currentEmail, onChanged }: ChangeEmailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Change your email</DialogTitle>
          <DialogDescription>The six-digit code goes to this address.</DialogDescription>
        </DialogHeader>
        {open ? (
          <ChangeEmailForm
            currentEmail={currentEmail}
            onCancel={() => onOpenChange(false)}
            onSaved={() => { onChanged(); onOpenChange(false); }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ChangeEmailForm({ currentEmail, onCancel, onSaved }: { currentEmail: string; onCancel: () => void; onSaved: () => void }) {
  const { updateUser } = useAuth();
  const [email, setEmail] = useState(currentEmail);
  const [validated, setValidated] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(false);

  const error = (validated === email ? errorFor(email) : undefined) ?? serverError;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setValidated(email);
    setServerError(undefined);
    if (errorFor(email)) return;
    setPending(true);
    try {
      const next = email.trim();
      await updateUser({ email: next });
      // The code follows the address, so the new one is asked for through the same seam.
      await authService.resendVerification(next);
      toast.success("Email updated", { description: `Your code now goes to ${next}.` });
      onSaved();
    } catch (err) {
      setServerError(errorMessage(err, "We couldn't change your email. Try again."));
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <DialogBody>
        <Field label="Email" error={error}>
          {(p) => (
            <Input
              {...p}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.rw"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setServerError(undefined); }}
              onBlur={() => { if (submitted) setValidated(email); }}
              className="h-11"
            />
          )}
        </Field>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" className="h-11" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" className="h-11" loading={pending}>Save email</Button>
      </DialogFooter>
    </form>
  );
}
