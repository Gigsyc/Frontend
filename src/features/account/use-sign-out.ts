"use client";

import { useRouter } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";

/**
 * The one Log out in the product.
 *
 * Signing out of a guarded page is a race: clearing the session re-renders `<RequireAuth>`
 * while the user is still standing on the protected route, and the guard's redirect to
 * /login?next=… is queued after our own walk home, so it wins and bounces them straight back
 * to the account they just left. The sign-out therefore raises a flag before it clears
 * anything; `<AccountRoute>` reads it and drops the guard in the same render, which leaves the
 * navigation home unopposed.
 */
let signingOut = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** True from the moment Log out is pressed until the guarded route has let go. */
export function useSigningOut() {
  return useSyncExternalStore(subscribe, () => signingOut, () => false);
}

/** Lowers the flag once the guarded route is off screen, so the next session starts clean. */
export function endSignOut() {
  if (!signingOut) return;
  signingOut = false;
  emit();
}

/** Leave for the homepage, then forget who was here. Used by the header menu and /account. */
export function useSignOut() {
  const router = useRouter();
  const { logout } = useAuth();

  return useCallback(() => {
    signingOut = true;
    emit();
    logout();
    toast.success("Signed out");
    router.replace("/");
  }, [logout, router]);
}
