"use client";

import { Link2Off } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AUTH_PANELS, AuthHeading, AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { authService } from "../../auth-service";
import { RedirectIfAuthenticated } from "../../guards";
import { NewPasswordForm } from "./new-password-form";
import { PasswordUpdatedPanel } from "./password-updated-panel";

/** /reset-password — the link from the email, then one new password. */
export function ResetPasswordScreen({ token }: { token?: string }) {
  return (
    <RedirectIfAuthenticated>
      <Reset token={token} />
    </RedirectIfAuthenticated>
  );
}

function Reset({ token }: { token?: string }) {
  const [done, setDone] = useState(false);

  const reset = async (password: string) => {
    await authService.resetPassword(password);
    setDone(true);
  };

  return (
    <AuthLayout panel={AUTH_PANELS.recover} backHref="/login" backLabel="Back to sign in">
      {!token ? (
        <InvalidLink />
      ) : done ? (
        <PasswordUpdatedPanel />
      ) : (
        <>
          <AuthHeading
            title="Choose a new password"
            description="You'll use it the next time you sign in to GigSyc."
          />
          <NewPasswordForm onSubmit={reset} />
        </>
      )}
    </AuthLayout>
  );
}

/**
 * No token in the URL: say so plainly and offer the only useful next step. The heading is
 * `AuthHeading` like every other panel in this shell — `EmptyState` would be the right
 * shape but its title is an `h3`, and this is the page's own heading.
 */
function InvalidLink() {
  return (
    <div className="text-center">
      <span className="mx-auto mb-5 inline-flex size-12 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
        <Link2Off className="size-6" aria-hidden />
      </span>
      <AuthHeading
        className="mb-0"
        title="This reset link is invalid or has expired"
        description="Reset links are single use and don’t last long. Ask for a new one and we’ll send fresh instructions."
      />
      <Button asChild className="mt-7 h-11 w-full">
        <Link href="/forgot-password">Request a new link</Link>
      </Button>
    </div>
  );
}
