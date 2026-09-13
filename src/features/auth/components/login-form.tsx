"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

/** Errors appear on submit, then re-check on blur — never while the visitor is still typing. */
export function LoginForm({ email, onEmail, onSubmit, pending, disabled, className }: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const next = { email: emailErrorFor(email), password: passwordErrorFor(password) };
    setErrors(next);
    if (next.email || next.password) return;
    onSubmit();
  };

  return (
    <form onSubmit={submit} noValidate className={cn("flex flex-col gap-4", className)}>
      <Field label="Email" error={errors.email}>
        {(p) => (
          <Input
            {...p}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.rw"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            onBlur={() => { if (submitted) setErrors((prev) => ({ ...prev, email: emailErrorFor(email) })); }}
            className="h-11"
          />
        )}
      </Field>

      <Field label="Password" error={errors.password}>
        {(p) => (
          <Input
            {...p}
            type={show ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => { if (submitted) setErrors((prev) => ({ ...prev, password: passwordErrorFor(password) })); }}
            className="h-11 pr-12"
            trailing={
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                className="inline-flex size-9 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-ink-100 hover:text-fg"
              >
                {show ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              </button>
            }
          />
        )}
      </Field>

      <div className="flex items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2.5 py-2 text-sm text-fg">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
          Remember me
        </label>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); toast("Password recovery is not part of the prototype."); }}
          className="py-2 text-sm font-medium text-navy-700 underline-offset-4 hover:underline"
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
