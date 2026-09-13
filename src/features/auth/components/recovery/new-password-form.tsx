"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MIN_PASSWORD_LENGTH } from "@/data/auth";
import { errorMessage } from "@/lib/utils";
import { PasswordStrength } from "./password-strength";

const passwordErrorFor = (value: string) =>
  value.length === 0
    ? "Choose a new password."
    : value.length < MIN_PASSWORD_LENGTH
      ? `Use at least ${MIN_PASSWORD_LENGTH} characters.`
      : undefined;

const confirmErrorFor = (value: string, password: string) =>
  value.length === 0 ? "Type the new password again." : value !== password ? "Those two passwords don't match." : undefined;

interface NewPasswordFormProps {
  /** Saves the password. Rejects with the service's `AuthError`. */
  onSubmit: (password: string) => Promise<void>;
}

/**
 * Two fields, validated on submit and then on blur. `validated` remembers the exact text
 * each message was written about — including which password the confirmation was compared
 * with — so a message clears the moment either value changes.
 */
export function NewPasswordForm({ onSubmit }: NewPasswordFormProps) {
  const failureId = useId();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validated, setValidated] = useState<{ password?: string; confirm?: string; against?: string }>({});
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const passwordError = validated.password === password ? passwordErrorFor(password) : undefined;
  const confirmError =
    validated.confirm === confirm && validated.against === password ? confirmErrorFor(confirm, password) : undefined;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setValidated({ password, confirm, against: password });
    setFailure(null);
    if (passwordErrorFor(password) || confirmErrorFor(confirm, password)) return;
    setPending(true);
    try {
      // Stays pending on success: the screen swaps this form for the confirmation.
      await onSubmit(password);
    } catch (err) {
      setFailure(errorMessage(err, "We couldn't save that password. Try again."));
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="New password" error={passwordError} hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
        {(p) => (
          <div className="flex flex-col gap-2">
            <Input
              {...p}
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => { if (submitted) setValidated((prev) => ({ ...prev, password })); }}
              className="h-11 pr-14"
              trailing={
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  aria-pressed={show}
                  className="inline-flex size-11 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-ink-100 hover:text-fg"
                >
                  {show ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                </button>
              }
            />
            <PasswordStrength value={password} />
          </div>
        )}
      </Field>

      <Field label="Confirm password" error={confirmError}>
        {(p) => (
          <Input
            {...p}
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => { if (submitted) setValidated((prev) => ({ ...prev, confirm, against: password })); }}
            className="h-11"
          />
        )}
      </Field>

      {failure ? (
        <p id={failureId} role="alert" className="rounded-md bg-danger-50 px-3 py-2.5 text-[13px] leading-5 text-danger-700">
          {failure}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full" loading={pending} aria-describedby={failure ? failureId : undefined}>
        Reset password
      </Button>
    </form>
  );
}
