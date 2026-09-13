"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AUTH_PANELS, AuthHeading, AuthLayout } from "@/components/layout/auth-layout";
import { AppleButton, AuthDivider, GoogleButton } from "@/components/ui/social-auth";
import { errorMessage } from "@/lib/utils";
import { AuthError } from "@/types";
import { useAuth } from "../../auth-provider";
import { safeNext } from "../../model";
import { RedirectIfAuthenticated } from "../../guards";
import { GoogleSignInDialog, useGoogleSignIn } from "../google";
import { AppleSignInDialog, useAppleSignIn } from "../apple";
import { SignupForm, type SignUpFieldError, type SignUpValues } from "./signup-form";

/** The two ways in. The partner copy is the one /become-a-partner sends people to. */
const COPY = {
  customer: {
    title: "Create your account",
    description: "Discover what's happening across Rwanda, and save the things you want to do.",
  },
  partner: {
    title: "Create your partner account",
    description: "List your events, reach people planning their week, and hire the team that runs the night.",
  },
} as const;

interface SignupScreenProps {
  /** `?role=partner` — the only role the public sign-up page will create. */
  partner?: boolean;
  /** `?next=` carried over to the sign-in link so the round trip keeps its destination. */
  next?: string;
}

export function SignupScreen({ partner, next }: SignupScreenProps) {
  return (
    <RedirectIfAuthenticated>
      <AuthLayout panel={AUTH_PANELS.signUp}>
        <SignupPanel partner={partner} next={safeNext(next)} />
      </AuthLayout>
    </RedirectIfAuthenticated>
  );
}

function SignupPanel({ partner, next }: SignupScreenProps) {
  const router = useRouter();
  const { signup } = useAuth();
  const role = partner ? "partner" : "customer";
  const copy = COPY[role];
  const google = useGoogleSignIn({ role, next });
  const apple = useAppleSignIn({ role, next });
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<SignUpFieldError | null>(null);

  const signInHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const googleBusy = google.pendingEmail !== null;
  const appleBusy = apple.pendingEmail !== null;

  const create = async (values: SignUpValues) => {
    setPending(true);
    setServerError(null);
    try {
      await signup({ ...values, ...(partner ? { role: "partner" as const } : {}) });
      toast.success("Account created", { description: "Enter the six-digit code to confirm your email." });
      router.push("/verify-email");
    } catch (err) {
      if (err instanceof AuthError && err.code === "email_taken") setServerError({ field: "email", message: err.message });
      else if (err instanceof AuthError && err.code === "weak_password") setServerError({ field: "password", message: err.message });
      else toast.error(errorMessage(err, "We couldn't create your account. Try again."));
      setPending(false);
    }
  };

  return (
    <>
      <AuthHeading title={copy.title} description={copy.description} />

      <div className="flex flex-col gap-2.5">
        <GoogleButton onClick={() => google.setOpen(true)} loading={googleBusy} disabled={pending} />
        <AppleButton onClick={() => apple.setOpen(true)} loading={appleBusy} disabled={pending} />
      </div>
      <AuthDivider label="or" className="my-6" />

      <SignupForm onSubmit={create} pending={pending} disabled={googleBusy} serverError={serverError} />

      <p className="mt-7 text-center text-sm text-fg-muted">
        Already have an account?{" "}
        <Link href={signInHref} className="font-medium text-navy-700 underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>

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
    </>
  );
}
