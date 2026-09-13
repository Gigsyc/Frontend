"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { destinationForUser, useAuth } from "@/features/auth";

/**
 * `/partner` is the address the auth layer routes a partner to; the workspace itself is the
 * employer portal — one organisation record, two vocabularies. This forwards rather than
 * duplicating the portal.
 *
 * It cannot be a server redirect: the session lives in localStorage, so a blind forward would
 * drop a customer, worker or admin inside the demo employer's organisation, looking at another
 * business's jobs, candidates and invoices. `destinationForUser` decides where everyone else
 * goes — verification and unfinished onboarding included — and only a partner who is past both
 * is handed the portal.
 */
export function PartnerWorkspaceGate() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace(`/login?next=${encodeURIComponent("/partner")}`); return; }
    const home = destinationForUser(user);
    router.replace(home === "/partner" ? "/employer" : home);
  }, [ready, user, router]);

  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <Spinner label="Opening your workspace" />
    </div>
  );
}
