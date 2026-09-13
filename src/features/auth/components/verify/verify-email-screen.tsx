"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AUTH_PANELS, AuthHeading, AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { errorMessage } from "@/lib/utils";
import { authService } from "../../auth-service";
import { useAuth } from "../../auth-provider";
import { RequireAuth } from "../../guards";
import { destinationForUser } from "../../model";
import { ChangeEmailDialog } from "./change-email-dialog";
import { CodeInput } from "./code-input";
import { VerifySuccess } from "./verify-success";

const RESEND_SECONDS = 30;
const linkClass = "inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-navy-700 underline-offset-4 transition-colors hover:underline disabled:cursor-not-allowed disabled:text-fg-subtle disabled:no-underline";

export function VerifyEmailScreen() {
  return (
    <RequireAuth>
      <AuthLayout panel={AUTH_PANELS.verify}>
        <VerifyPanel />
      </AuthLayout>
    </RequireAuth>
  );
}

function VerifyPanel() {
  const router = useRouter();
  const { user, verifyEmail } = useAuth();
  const errorId = useId();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);

  /** Someone who is already verified has no business here — send them on. */
  useEffect(() => {
    if (status !== "idle" || !user?.emailVerified) return;
    router.replace(destinationForUser(user));
  }, [status, user, router]);

  /** The success state is held just long enough to be read, then it hands over. */
  useEffect(() => {
    if (status !== "done" || !user) return;
    const timer = window.setTimeout(() => router.replace(destinationForUser(user)), 900);
    return () => window.clearTimeout(timer);
  }, [status, user, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  if (!user) return null;
  if (status === "done") return <VerifySuccess />;
  // Already verified: the effect above is handing over, so never paint a form that is
  // about to disappear — and never leave one that can be focused or submitted.
  if (status === "idle" && user.emailVerified) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <Spinner label="Taking you to the next step" />
      </div>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== 6 || status !== "idle") return;
    setStatus("verifying");
    setError(null);
    try {
      await verifyEmail(code);
      setStatus("done");
    } catch (err) {
      setError(errorMessage(err, "We couldn't check that code. Try again."));
      setStatus("idle");
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await authService.resendVerification(user.email);
      toast.success("Code sent again", { description: "Nothing is really sent in the prototype — any six digits will work." });
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      toast.error(errorMessage(err, "We couldn't send that code again."));
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <AuthHeading
        title="Verify your email"
        description={<>We sent a six-digit code to <span className="font-medium text-fg">{user.email}</span>.</>}
      />

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <CodeInput
          label="Six-digit code"
          value={code}
          onChange={(next) => { setCode(next); if (error) setError(null); }}
          disabled={status === "verifying"}
          invalid={!!error}
          describedBy={error ? errorId : undefined}
        />
        {error ? <p id={errorId} role="alert" className="text-[13px] text-danger-600">{error}</p> : null}

        <Button type="submit" className="h-11 w-full" loading={status === "verifying"} disabled={code.length !== 6}>
          Verify email
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-x-6">
        <button type="button" onClick={resend} disabled={cooldown > 0 || resending || status !== "idle"} className={linkClass}>
          {cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend email"}
        </button>
        <button type="button" onClick={() => setChangeOpen(true)} disabled={status !== "idle"} className={linkClass}>
          Change email
        </button>
      </div>

      <p className="mt-8 border-t border-border pt-5 text-[13px] leading-5 text-fg-subtle">
        Prototype — no email is actually sent. Any six digits will work.
      </p>

      <ChangeEmailDialog
        open={changeOpen}
        onOpenChange={setChangeOpen}
        currentEmail={user.email}
        onChanged={() => { setCode(""); setError(null); setCooldown(0); }}
      />
    </>
  );
}
