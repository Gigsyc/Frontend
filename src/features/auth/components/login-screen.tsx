"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AUTH_PANELS, AuthHeading, AuthLayout } from "@/components/layout/auth-layout";
import { AppleButton, AuthDivider, GoogleButton } from "@/components/ui/social-auth";
import { accountForEmail, accountForHint, type DemoAccount } from "../accounts";
import { useAuth } from "../auth-provider";
import { RedirectIfAuthenticated } from "../guards";
import { safeNext } from "../model";
import { useSignIn } from "../use-sign-in";
import { DemoAccountList } from "./demo-account-list";
import { GoogleSignInDialog, useGoogleSignIn } from "./google";
import { AppleSignInDialog, useAppleSignIn } from "./apple";
import { LoginForm } from "./login-form";

/** Names the account list for screen readers with the same words the divider shows. */
const CONTINUE_AS_ID = "login-continue-as";

interface LoginScreenProps {
  /** `?as=` from the marketing call to action — "worker", "employer", "organizer", "admin". */
  hint?: string;
  /** `?next=` set by `RequireAuth` when a protected page bounced the visitor here. */
  next?: string;
}

/**
 * /login — photograph on the left, one form on the right, no site chrome.
 *
 * Every way in — credentials, Google, a demo row — ends by writing the session and
 * nothing else. The guard below is the single navigator: it is handed `?next=` and
 * decides whether to follow it, so two routes can never race each other.
 */
export function LoginScreen({ hint, next }: LoginScreenProps) {
  const target = safeNext(next);
  return (
    <RedirectIfAuthenticated to={target}>
      <SignIn hint={hint} next={target} />
    </RedirectIfAuthenticated>
  );
}

function SignIn({ hint, next }: LoginScreenProps) {
  const { login } = useAuth();
  const hinted = accountForHint(hint);
  const [picked, setPicked] = useState<DemoAccount | null>(null);
  /** Arriving from "Find shifts" or "Post a shift" fills in the person that button meant. */
  const [email, setEmail] = useState(() => hinted?.email ?? "");
  const [formPending, setFormPending] = useState(false);
  const { enter, pendingId, busy } = useSignIn();
  const google = useGoogleSignIn({ next });
  const apple = useAppleSignIn({ next });

  const typed = accountForEmail(email);
  const selectedId = picked?.id ?? typed?.id ?? hinted?.id ?? null;
  const googleBusy = google.pendingEmail !== null;
  const appleBusy = apple.pendingEmail !== null;
  /** Everything the form is not: what should hold the form still. */
  const elsewhereBusy = busy || googleBusy;
  /** Any sign-in at all. One person, one session — a second attempt must not start. */
  const anyBusy = elsewhereBusy || formPending;
  const signUpHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";

  const choose = (account: DemoAccount) => {
    setPicked(account);
    setEmail(account.email);
    enter(account, account.id);
  };

  /** Credentials go to the service. An address it does not know now fails, as it should. */
  const signIn = async (address: string, password: string, remember: boolean) => {
    const user = await login(address, password, remember);
    toast.success("Signed in", { description: `Welcome back, ${user.name.split(" ")[0]}.` });
  };

  return (
    <AuthLayout panel={AUTH_PANELS.signIn}>
      <AuthHeading
        title="Welcome back"
        description="Sign in to discover events, manage your team or run the platform."
      />

      <div className="flex flex-col gap-2.5">
        <GoogleButton onClick={() => google.setOpen(true)} loading={googleBusy} disabled={anyBusy} />
        <AppleButton onClick={() => apple.setOpen(true)} loading={appleBusy} disabled={anyBusy} />
      </div>
      <GoogleSignInDialog
        open={google.open}
        onOpenChange={google.setOpen}
        pendingEmail={google.pendingEmail}
        onChoose={google.choose}
      />
      <AppleSignInDialog
        open={apple.open}
        onOpenChange={apple.setOpen}
        pendingEmail={apple.pendingEmail}
        onChoose={apple.choose}
      />

      <AuthDivider className="my-6" />

      <LoginForm
        email={email}
        onEmail={setEmail}
        onSubmit={signIn}
        disabled={elsewhereBusy}
        onPendingChange={setFormPending}
      />

      <AuthDivider label="Or continue as" labelId={CONTINUE_AS_ID} className="mt-8" />

      <DemoAccountList
        className="mt-5"
        labelledBy={CONTINUE_AS_ID}
        selectedId={selectedId}
        pendingId={pendingId}
        busy={anyBusy}
        onChoose={choose}
      />

      <p className="mt-8 text-center text-sm text-fg-muted">
        New to GigSyc?{" "}
        <Link href={signUpHref} className="font-medium text-navy-700 underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>

      <p className="mt-6 text-center text-xs text-fg-subtle">
        Prototype — no real accounts, payments or messages.
      </p>
    </AuthLayout>
  );
}
