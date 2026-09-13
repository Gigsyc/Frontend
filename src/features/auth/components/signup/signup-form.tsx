"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MIN_PASSWORD_LENGTH } from "@/data/auth";
import { cn } from "@/lib/utils";
import { PasswordStrength } from "./password-strength";

export interface SignUpValues { name: string; email: string; password: string }
/** An `AuthError` the service raised, pinned to the field it is about. */
export interface SignUpFieldError { field: "email" | "password"; message: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY: SignUpValues = { name: "", email: "", password: "" };

const nameErrorFor = (v: string) => (v.trim().length >= 2 ? undefined : "Enter the name people should see.");
const emailErrorFor = (v: string) => (EMAIL.test(v.trim()) ? undefined : "Enter an email address, like you@example.rw.");
const passwordErrorFor = (v: string) => (v.length >= MIN_PASSWORD_LENGTH ? undefined : `Use at least ${MIN_PASSWORD_LENGTH} characters.`);

interface SignupFormProps {
  onSubmit: (values: SignUpValues) => void;
  pending: boolean;
  /** True while the Google chooser is signing someone in. */
  disabled: boolean;
  serverError: SignUpFieldError | null;
}

/**
 * Errors appear on submit, then re-check on blur — never while someone is still typing.
 * `validated` holds the exact text each message was written about, so a message clears
 * the moment its value changes; the same trick keeps a service error ("that email is
 * taken") on screen only until the address is edited.
 */
export function SignupForm({ onSubmit, pending, disabled, serverError }: SignupFormProps) {
  const termsId = useId();
  const [values, setValues] = useState<SignUpValues>(EMPTY);
  const [validated, setValidated] = useState<Partial<SignUpValues>>({});
  const [sent, setSent] = useState<SignUpValues | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [terms, setTerms] = useState(false);
  const [show, setShow] = useState(false);

  const set = (patch: Partial<SignUpValues>) => setValues((prev) => ({ ...prev, ...patch }));
  const recheck = (key: keyof SignUpValues) => () => {
    if (submitted) setValidated((prev) => ({ ...prev, [key]: values[key] }));
  };
  const fromServer = (field: SignUpFieldError["field"]) =>
    serverError?.field === field && sent?.[field] === values[field] ? serverError.message : undefined;

  const nameError = validated.name === values.name ? nameErrorFor(values.name) : undefined;
  const emailError = (validated.email === values.email ? emailErrorFor(values.email) : undefined) ?? fromServer("email");
  const passwordError = (validated.password === values.password ? passwordErrorFor(values.password) : undefined) ?? fromServer("password");
  const termsError = submitted && !terms ? "Tick the box to create your account." : undefined;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setValidated(values);
    if (nameErrorFor(values.name) || emailErrorFor(values.email) || passwordErrorFor(values.password) || !terms) return;
    setSent(values);
    onSubmit({ name: values.name.trim(), email: values.email.trim(), password: values.password });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Full name" error={nameError}>
        {(p) => (
          <Input
            {...p}
            type="text"
            autoComplete="name"
            placeholder="Yvette Mukandori"
            value={values.name}
            onChange={(e) => set({ name: e.target.value })}
            onBlur={recheck("name")}
            className="h-11"
          />
        )}
      </Field>

      <Field label="Email" error={emailError}>
        {(p) => (
          <Input
            {...p}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.rw"
            value={values.email}
            onChange={(e) => set({ email: e.target.value })}
            onBlur={recheck("email")}
            className="h-11"
          />
        )}
      </Field>

      <Field label="Password" error={passwordError} hint={`At least ${MIN_PASSWORD_LENGTH} characters`}>
        {(p) => (
          <div className="flex flex-col gap-2">
            <Input
              {...p}
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.password}
              onChange={(e) => set({ password: e.target.value })}
              onBlur={recheck("password")}
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
            <PasswordStrength value={values.password} />
          </div>
        )}
      </Field>

      <div className="flex flex-col gap-1.5">
        <div className="flex min-h-11 items-center gap-3">
          <Checkbox
            id={termsId}
            checked={terms}
            onCheckedChange={(v) => setTerms(v === true)}
            aria-describedby={termsError ? `${termsId}-error` : undefined}
            aria-invalid={termsError ? true : undefined}
            className={cn("size-5", termsError && "border-danger-500")}
          />
          <label htmlFor={termsId} className="text-[13px] leading-5 text-fg-muted">
            I agree to the{" "}
            {/* New tab: reading these mid-form must not throw away a half-typed sign-up. */}
            <Link href="/how-it-works#trust" target="_blank" rel="noopener" className="font-medium text-navy-700 underline underline-offset-4">Terms</Link>
            {" "}and{" "}
            <Link href="/how-it-works#trust" target="_blank" rel="noopener" className="font-medium text-navy-700 underline underline-offset-4">Privacy Policy</Link>
          </label>
        </div>
        {termsError ? <p id={`${termsId}-error`} role="alert" className="text-[13px] text-danger-600">{termsError}</p> : null}
      </div>

      <Button type="submit" className="mt-1 h-11 w-full" loading={pending} disabled={disabled}>
        Create account
      </Button>
    </form>
  );
}
