"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { authService } from "./auth-service";
import { useAuth } from "./auth-provider";
import type { DemoAccount, LoginHint } from "./accounts";

/** Demo row → seeded account. The login page names people, not persona objects. */
const ACCOUNT_FOR_HINT: Record<LoginHint, string> = {
  customer: "ac_chantal",
  organizer: "ac_diane",
  worker: "ac_aline",
  admin: "ac_patrick",
};

/**
 * Signs in one of the seeded demo accounts. Real credential sign-in goes through
 * `useAuth().login` instead.
 *
 * It does not navigate: the login page's `<RedirectIfAuthenticated>` is the single
 * navigator for every way in, so the row keeps whatever `?next=` the page was given
 * instead of pushing a destination that would then be replaced.
 */
export function useSignIn() {
  const { setUser } = useAuth();
  const [pendingId, setPendingId] = useState<string | null>(null);

  /** `source` is the control to show as loading — an account id, or "form". */
  const enter = useCallback(async (account: DemoAccount, source: string) => {
    if (pendingId) return;
    setPendingId(source);
    try {
      const user = await authService.getAccount(ACCOUNT_FOR_HINT[account.id]);
      // Stays pending: writing the session is what moves the page on, so the row never settles back.
      setUser(user);
      toast.success("Signed in", { description: `${account.name} · opening ${account.landing}.` });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We couldn't sign you in.");
      setPendingId(null);
    }
  }, [pendingId, setUser]);

  return { enter, pendingId, busy: pendingId !== null };
}
