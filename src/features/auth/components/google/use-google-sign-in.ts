"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ROLE_HOME } from "@/data/auth";
import { errorMessage } from "@/lib/utils";
import type { UserRole } from "@/types";
import type { GoogleAccount } from "../../auth-service";
import { useAuth } from "../../auth-provider";
import { destinationForUser, safeNext } from "../../model";

export interface UseGoogleSignInOptions {
  /** The role a brand-new Google account is created with. Customer unless the partner path asks. */
  role?: Extract<UserRole, "customer" | "partner">;
  /**
   * `?next=` from a protected page that bounced the visitor here, so Google lands on the
   * same destination the credential form would. It is only a preference: it is re-checked
   * with `safeNext`, and `destinationForUser` outranks it, so a new account still goes to
   * verification or onboarding rather than straight onto a protected page.
   */
  next?: string;
}

export interface GoogleSignIn {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Email of the row currently signing in, so only that row shows its own spinner. */
  pendingEmail: string | null;
  choose: (account: GoogleAccount) => void;
}

/**
 * The whole simulated Google flow, shared by /login and /signup.
 *
 * No credential ever passes through here: the chooser hands back an account the person
 * picked and the service decides whether that address already has a GigSyc account —
 * one signs straight in, the other is created and goes on to onboarding.
 */
export function useGoogleSignIn({ role, next }: UseGoogleSignInOptions = {}): GoogleSignIn {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [open, setOpenState] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  /** The dialog cannot be dismissed mid-flight; closing it would strand the sign-in. */
  const setOpen = useCallback((wanted: boolean) => {
    setOpenState((current) => (pendingEmail ? current : wanted));
  }, [pendingEmail]);

  const choose = useCallback((account: GoogleAccount) => {
    if (pendingEmail) return;
    setPendingEmail(account.email);
    void (async () => {
      try {
        const user = await loginWithGoogle(account, role);
        toast.success("Signed in with Google", { description: `${user.name} · ${user.email}` });
        // A brand-new Google account still owes us onboarding, so `next` is only followed
        // once `destinationForUser` has nothing left to ask for.
        const home = destinationForUser(user);
        const settled = user.onboardingCompleted && home === ROLE_HOME[user.role];
        router.push(settled ? (safeNext(next) ?? home) : home);
      } catch (err) {
        toast.error(errorMessage(err, "We couldn't finish signing you in with Google."));
        setPendingEmail(null);
      }
    })();
  }, [loginWithGoogle, next, pendingEmail, role, router]);

  return { open, setOpen, pendingEmail, choose };
}
