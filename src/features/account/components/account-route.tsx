"use client";

import { useEffect } from "react";
import { RequireAuth, useAuth } from "@/features/auth";
import { endSignOut, useSigningOut } from "../use-sign-out";
import { AccountScreen } from "./account-screen";
import { AccountSkeleton } from "./account-skeleton";

/**
 * Everything /account has to settle before the screen can paint, in one place.
 *
 * The session is read from localStorage on the client, so the first render knows nothing. That
 * wait is covered by the same skeleton the page prerenders — the account never flashes a
 * purpose-built skeleton and then throws it away for a spinner. Once the session is in,
 * `<RequireAuth>` owns the signed-out rule, as it does everywhere else.
 *
 * The guard comes off during a sign-out: the user asked to leave, so the redirect back to
 * /login?next=/account would be the opposite of what they said.
 */
export function AccountRoute() {
  const { ready } = useAuth();
  const signingOut = useSigningOut();

  // The flag only has to cover the walk home; however this route leaves, lower it again.
  useEffect(() => endSignOut, []);

  if (!ready || signingOut) return <AccountSkeleton />;

  return (
    <RequireAuth>
      <AccountScreen />
    </RequireAuth>
  );
}
