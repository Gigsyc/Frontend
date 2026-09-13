"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn, errorMessage } from "@/lib/utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailErrorFor = (value: string) =>
  EMAIL.test(value.trim()) ? undefined : "Enter an email address, like diane@ikaze.rw.";
const passwordErrorFor = (value: string) => (value.length === 0 ? "Enter your password." : undefined);

/** Carries whatever has been typed over to the recovery page so it is not asked twice. */
function forgotHref(email: string) {
  const typed = email.trim();
  return typed ? `/forgot-password?email=${encodeURIComponent(typed)}` : "/forgot-password";
}

interface LoginFormProps {
  email: string;
  onEmail: (value: string) => void;
  /** Signs in. Rejects with the service's `AuthError`, whose message is shown above the button. */
  onSubmit: (email: string, password: string, remember: boolean) => Promise<void>;
  /** True while Google or a demo account row is signing in. */
  disabled: boolean;
  /** Reports this form's own pending state up, so the screen can hold everything else still. */
  onPendingChange?: (pending: boolean) => void;
  className?: string;
}

/**
 * Errors appear on submit, then re-check on blur — never while the visitor is still typing.
 * `validated` holds the exact text each message was written about, so a message disappears
 * as soon as its value changes: a correction being typed, or an account picked from the
 * list below, which fills the email field from outside this component.
 */
export function LoginForm({ email, onEmail, onSubmit, disabled, onPendingChange, className }: LoginFormProps) {
  const failureId = useId();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  // Remembered sessions persist across browser restarts; unremembered ones end with the tab.
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [validated, setValidated] = useState<{ email?: string; password?: string }>({});
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const emailError = validated.email === email ? emailErrorFor(email) : undefined;
  const passwordError = validated.password === password ? passwordErrorFor(password) : undefined;

  /** Kept in step with the screen, which uses it to disable Google and the account rows. */
  const setBusy = (value: boolean) => {
    setPending(value);
    onPendingChange?.(value);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Enter still submits a form whose button is disabled, so the guard lives here too:
    // another sign-in is already running and a second one would write a second session.
    if (disabled || pending) return;
    setSubmitted(true);
    setValidated({ email, password });
    setFailure(null);
    if (emailErrorFor(email) || passwordErrorFor(password)) return;
    setBusy(true);
    try {
      // Stays pending on success: the screen navigates away rather than settling back.
      await onSubmit(email, password, remember);
    } catch (err) {
      setFailure(errorMessage(err, "We couldn't sign you in. Try again."));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={cn("flex flex-col gap-4", className)}>
      {/* `contents` keeps the form's own layout; the fieldset is only here to go inert together. */}
      <fieldset disabled={disabled} className="contents">
        <Field label="Email" error={emailError}>
          {(p) => (
            <Input
              {...p}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.rw"
              value={email}
              onChange={(e) => onEmail(e.target.value)}
              onBlur={() => { if (submitted) setValidated((prev) => ({ ...prev, email })); }}
              className="h-11"
            />
          )}
        </Field>

        <Field label="Password" error={passwordError}>
          {(p) => (
            <Input
              {...p}
              type={show ? "text" : "password"}
              autoComplete="current-password"
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
          )}
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-fg">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} disabled={disabled} />
            Remember me
          </label>
          <Link
            href={forgotHref(email)}
            className="inline-flex min-h-11 items-center text-sm font-medium text-navy-700 underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {failure ? (
          <p id={failureId} role="alert" className="rounded-md bg-danger-50 px-3 py-2.5 text-[13px] leading-5 text-danger-700">
            {failure}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full"
          loading={pending}
          disabled={disabled}
          aria-describedby={failure ? failureId : undefined}
        >
          Sign in
        </Button>
      </fieldset>
    </form>
  );
}
