"use client";

import { useState, type FormEvent } from "react";
import { AUTH_PANELS, AuthHeading, AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/utils";
import { authService } from "../../auth-service";
import { RedirectIfAuthenticated } from "../../guards";
import { CheckEmailPanel } from "./check-email-panel";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailErrorFor = (value: string) =>
  EMAIL.test(value.trim()) ? undefined : "Enter the email address you signed up with.";

/** /forgot-password — one field, then a confirmation that gives nothing away. */
export function ForgotPasswordScreen({ email }: { email?: string }) {
  return (
    <RedirectIfAuthenticated>
      <Recover initialEmail={email ?? ""} />
    </RedirectIfAuthenticated>
  );
}

function Recover({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  /** The exact text the current message was written about, so it clears as soon as it changes. */
  const [validated, setValidated] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const fieldError = validated === email ? emailErrorFor(email) : undefined;

  /** Always reports success — the service will not say which addresses it knows. */
  const send = async (address: string) => { await authService.requestPasswordReset(address); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setValidated(email);
    setFailure(null);
    if (emailErrorFor(email)) return;
    setPending(true);
    try {
      const address = email.trim();
      await send(address);
      setSentTo(address);
    } catch (err) {
      setFailure(errorMessage(err, "We couldn't send that right now. Try again."));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout panel={AUTH_PANELS.recover} backHref="/login" backLabel="Back to sign in">
      {sentTo ? (
        <CheckEmailPanel
          email={sentTo}
          onResend={() => send(sentTo)}
          onUseDifferent={() => { setSentTo(null); setFailure(null); }}
        />
      ) : (
        <>
          <AuthHeading
            title="Forgot your password?"
            description="Enter the email you signed up with and we'll send reset instructions."
          />
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <Field label="Email" error={fieldError}>
              {(p) => (
                <Input
                  {...p}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.rw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => { if (submitted) setValidated(email); }}
                  className="h-11"
                />
              )}
            </Field>

            {failure ? (
              <p role="alert" className="rounded-md bg-danger-50 px-3 py-2.5 text-[13px] leading-5 text-danger-700">{failure}</p>
            ) : null}

            <Button type="submit" className="h-11 w-full" loading={pending}>
              Send reset instructions
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
