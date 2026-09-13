"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HOME_FOR_ROLE, useSession } from "@/features/session";
import type { DemoAccount } from "./accounts";

/** Enough simulated work that the pending state reads as real, not as a flicker. */
const SIGN_IN_MS = 700;

/**
 * Composes the session store with the router: one sign-in at a time, a visible pending
 * state on whichever control started it, then persona + redirect.
 */
export function useSignIn() {
  const router = useRouter();
  const { signIn } = useSession();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /** `source` is the control to show as loading — an account id, or "form". */
  const enter = useCallback((account: DemoAccount, source: string) => {
    if (timer.current) return;
    setPendingId(source);
    timer.current = setTimeout(() => {
      timer.current = null;
      signIn(account.persona);
      toast.success("Signed in", { description: `${account.name} · opening ${account.landing}.` });
      router.push(HOME_FOR_ROLE[account.persona.role]);
    }, SIGN_IN_MS);
  }, [router, signIn]);

  return { enter, pendingId, busy: pendingId !== null };
}
