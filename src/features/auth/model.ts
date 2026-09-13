import type { AuthUser, Persona, UserRole } from "@/types";
import { ROLE_HOME } from "@/data/auth";

/**
 * The workforce product is built on `Persona`. Rather than run two identity systems,
 * every persona is derived from the signed-in `AuthUser` — one source of truth.
 */
export function personaForUser(user: AuthUser | null): Persona | null {
  if (!user) return null;
  switch (user.role) {
    case "partner":
      return user.employerId ? { role: "employer", userId: user.id, employerId: user.employerId } : null;
    case "worker":
      return user.workerId ? { role: "worker", userId: user.workerId } : null;
    case "admin":
      return { role: "admin", userId: user.platformUserId ?? user.id };
    case "customer":
    default:
      return { role: "customer", userId: user.platformUserId ?? user.id };
  }
}

/** Where this user belongs right now: onboarding if unfinished, otherwise their home. */
export function destinationForUser(user: AuthUser): string {
  if (!user.emailVerified && user.signInMethod === "email") return "/verify-email";
  if (!user.onboardingCompleted) return onboardingPathForRole(user.role);
  return ROLE_HOME[user.role];
}

/**
 * Where someone goes the moment they are signed in, `?next=` included.
 *
 * The pending step always wins: an unverified email or unfinished onboarding sends them
 * to /verify-email or /onboarding no matter what the link asked for, so a deep link can
 * never walk past either. Once both are done, `next` is honoured — after `safeNext`, so
 * only a same-origin path is ever followed.
 */
export function destinationAfterSignIn(user: AuthUser, next?: string | null): string {
  const home = destinationForUser(user);
  if (home !== ROLE_HOME[user.role]) return home;
  return safeNext(next) ?? home;
}

export function onboardingPathForRole(role: UserRole): string {
  switch (role) {
    case "partner": return "/onboarding/partner";
    case "worker": return "/worker/onboarding";
    // Admins never see consumer onboarding.
    case "admin": return ROLE_HOME.admin;
    default: return "/onboarding";
  }
}

/**
 * `?next=` is attacker-reachable, so only a same-origin path is ever followed: one
 * leading slash, and never "//" or "/\", both of which a browser reads as another
 * host. Everything that consumes a `next` value goes through this — login, sign-up and
 * the Google chooser — so the rule is written once.
 */
export function safeNext(value: string | null | undefined): string | undefined {
  if (!value || value[0] !== "/" || value[1] === "/" || value[1] === "\\") return undefined;
  return value;
}

export function isPartner(user: AuthUser | null) { return user?.role === "partner"; }
export function isAdmin(user: AuthUser | null) { return user?.role === "admin"; }
