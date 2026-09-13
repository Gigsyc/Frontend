"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailErrorFor = (value: string) =>
  EMAIL.test(value.trim()) ? undefined : "Enter an email address, like diane@ikaze.rw.";
const passwordErrorFor = (value: string) => (value.length === 0 ? "Enter your password." : undefined);

interface LoginFormProps {
  email: string;
  onEmail: (value: string) => void;
  /** Called once email and password pass validation. */
  onSubmit: () => void;
  pending: boolean;
  /** True while a demo account row is signing in. */
  disabled: boolean;
  className?: string;
}

/**
 * Errors appear on submit, then re-check on blur — never while the visitor is still typing.
 * `validated` holds the exact text each message was written about, so a message disappears
 * as soon as its value changes: a correction being typed, or an account picked from the
 * list below, which fills the email field from outside this component.
 */
export function LoginForm({ email, onEmail, onSubmit, pending, disabled, className }: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [validated, setValidated] = useState<{ email?: string; password?: string }>({});

  const emailError = validated.email === email ? emailErrorFor(email) : undefined;
  const passwordError = validated.password === password ? passwordErrorFor(password) : undefined;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setValidated({ email, password });
    if (emailErrorFor(email) || passwordErrorFor(password)) return;
    onSubmit();
  };

  return (
    <form onSubmit={submit} noValidate className={cn("flex flex-col gap-4", className)}>
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

      <div className="flex items-center justify-between gap-3">
        <CheckboxField
          label="Remember me"
          checked={remember}
          onCheckedChange={(v) => setRemember(v === true)}
          className="min-h-11 items-center"
        />
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); toast("Password recovery is not part of the prototype."); }}
          className="inline-flex min-h-11 items-center text-sm font-medium text-navy-700 underline-offset-4 hover:underline"
        >
          Forgot password?
        </a>
      </div>

      <Button type="submit" className="h-11 w-full" loading={pending} disabled={disabled}>
        Sign in
      </Button>
    </form>
  );
}
