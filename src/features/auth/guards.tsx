"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import type { UserRole } from "@/types";
import { useAuth } from "./auth-provider";
import { destinationAfterSignIn, destinationForUser } from "./model";

/**
 * Centralised routing rules. Auth lives in localStorage, so these run on the client
 * after hydration rather than in middleware. Every guard waits for `ready` before
 * redirecting, which is what stops a signed-in user being bounced to /login on reload.
 */

function Waiting({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}

/** Signed out → /login, remembering where they were headed. */
export function RequireAuth({ children, redirectTo = "/login" }: { children: ReactNode; redirectTo?: string }) {
  const { isAuthenticated, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready || isAuthenticated) return;
    const next = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
    router.replace(next && next !== "/" ? `${redirectTo}?next=${encodeURIComponent(next)}` : redirectTo);
  }, [ready, isAuthenticated, router, redirectTo]);

  if (!ready || !isAuthenticated) return <Waiting label="Checking your session" />;
  return <>{children}</>;
}

/** Wrong role → their own home. Use on /admin and the partner workspace. */
export function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const allowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/login"); return; }
    if (!allowed) router.replace(destinationForUser(user));
  }, [ready, user, allowed, router]);

  if (!ready || !allowed) return <Waiting label="Checking your access" />;
  return <>{children}</>;
}

/**
 * Already signed in → straight past the auth pages.
 *
 * This is the **only** thing that navigates away from an auth page. A sign-in form that
 * pushed its own destination would race this effect and lose, so pages hand their
 * `?next=` here as `to` and let one navigation happen. `destinationAfterSignIn` decides
 * whether `to` is followed at all: verification and onboarding come first.
 */
export function RedirectIfAuthenticated({ children, to }: { children: ReactNode; to?: string }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(destinationAfterSignIn(user, to));
  }, [ready, user, router, to]);

  if (ready && user) return <Waiting label="Taking you back" />;
  return <>{children}</>;
}

/** Onboarding pages: signed in, and not already finished. */
export function RequireOnboarding({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/login"); return; }
    if (user.onboardingCompleted) router.replace(destinationForUser(user));
  }, [ready, user, router, role]);

  if (!ready || !user || user.onboardingCompleted) return <Waiting label="One moment" />;
  return <>{children}</>;
}
