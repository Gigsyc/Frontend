"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ROLE_HOME } from "@/data/auth";
import { APPLE_RELAY_DOMAIN } from "@/data/mocks/accounts";
import { errorMessage } from "@/lib/utils";
import type { UserRole } from "@/types";
import type { SocialAccount } from "../../auth-service";
import { useAuth } from "../../auth-provider";
import { destinationForUser, safeNext } from "../../model";

/** An Apple ID row, plus whether this person hides their real address. */
export interface AppleIdAccount extends SocialAccount {
  hideMyEmail: boolean;
}

export interface UseAppleSignInOptions {
  role?: Extract<UserRole, "customer" | "partner">;
  /** Same contract as the Google hook: a preference, never a way past onboarding. */
  next?: string;
}

export interface AppleSignIn {
  open: boolean;
  setOpen: (open: boolean) => void;
  pendingEmail: string | null;
  choose: (account: AppleIdAccount) => void;
}

/**
 * Apple's Hide My Email gives the app a per-developer relay address instead of the
 * person's own. We reproduce that, because it changes what an organiser ever sees.
 */
export function relayAddressFor(email: string): string {
  const handle = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 10);
  return `${handle}_${handle.length}x${handle.slice(0, 3)}@${APPLE_RELAY_DOMAIN}`;
}

/**
 * The simulated Apple flow, shared by /login and /signup.
 *
 * No credential passes through here. The chooser hands back an Apple ID the person
 * picked; the service decides whether that address already has a GigSyc account.
 */
export function useAppleSignIn({ role, next }: UseAppleSignInOptions = {}): AppleSignIn {
  const router = useRouter();
  const { loginWithApple } = useAuth();
  const [open, setOpenState] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  /** Locked mid-flight; closing would strand the sign-in. */
  const setOpen = useCallback((wanted: boolean) => {
    setOpenState((current) => (pendingEmail ? current : wanted));
  }, [pendingEmail]);

  const choose = useCallback((account: AppleIdAccount) => {
    if (pendingEmail) return;
    setPendingEmail(account.email);
    void (async () => {
      try {
        const email = account.hideMyEmail ? relayAddressFor(account.email) : account.email;
        const user = await loginWithApple({ ...account, email }, role);
        toast.success("Signed in with Apple", {
          description: account.hideMyEmail
            ? `${user.name} · your real address stays hidden`
            : `${user.name} · ${user.email}`,
        });
        const home = destinationForUser(user);
        const settled = user.onboardingCompleted && home === ROLE_HOME[user.role];
        router.push(settled ? (safeNext(next) ?? home) : home);
      } catch (err) {
        toast.error(errorMessage(err, "We couldn't finish signing you in with Apple."));
        setPendingEmail(null);
      }
    })();
  }, [loginWithApple, next, pendingEmail, role, router]);

  return { open, setOpen, pendingEmail, choose };
}
