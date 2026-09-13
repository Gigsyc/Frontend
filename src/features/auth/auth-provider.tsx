"use client";

import { useRouter } from "next/navigation";
import {
  createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode,
} from "react";
import type {
  AuthUser, CustomerOnboardingInput, PartnerOnboardingInput, Persona, SignUpInput,
} from "@/types";
import { authService, type SocialAccount } from "./auth-service";
import { destinationForUser, personaForUser } from "./model";

const KEY = "gigsyc.prototype.auth";

/**
 * The signed-in user lives in localStorage and is read through useSyncExternalStore,
 * so the server render and the first client render agree (null, not ready) and no
 * state is set inside an effect.
 */
interface Snapshot { user: AuthUser | null; ready: boolean }
const SERVER_SNAPSHOT: Snapshot = { user: null, ready: false };
let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

function read(): Snapshot {
  if (!snapshot) {
    let user: AuthUser | null = null;
    try {
      // "Remember me" decides which store the session went into, so both are read back.
      const raw = window.localStorage.getItem(KEY) ?? window.sessionStorage.getItem(KEY);
      if (raw) user = JSON.parse(raw) as AuthUser;
    } catch { /* private mode */ }
    snapshot = { user, ready: true };
  }
  return snapshot;
}

/**
 * `remember` is what makes the sign-in checkbox mean something: remembered sessions go
 * to localStorage and survive closing the browser, the rest to sessionStorage and do not.
 * Once a session exists, later writes keep whichever store it already lives in.
 */
function write(user: AuthUser | null, remember?: boolean) {
  snapshot = { user, ready: true };
  try {
    const alreadyRemembered = window.localStorage.getItem(KEY) !== null;
    const persist = remember ?? alreadyRemembered;
    window.localStorage.removeItem(KEY);
    window.sessionStorage.removeItem(KEY);
    if (user) {
      (persist ? window.localStorage : window.sessionStorage).setItem(KEY, JSON.stringify(user));
    }
  } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export interface AuthContextValue {
  user: AuthUser | null;
  persona: Persona | null;
  isAuthenticated: boolean;
  /** False until localStorage has been read on the client. Guards must wait for this. */
  ready: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<AuthUser>;
  loginWithGoogle: (account: SocialAccount, role?: AuthUser["role"]) => Promise<AuthUser>;
  loginWithApple: (account: SocialAccount, role?: AuthUser["role"]) => Promise<AuthUser>;
  signup: (input: SignUpInput) => Promise<AuthUser>;
  logout: () => void;
  verifyEmail: (code: string) => Promise<AuthUser>;
  completeOnboarding: (input: CustomerOnboardingInput) => Promise<AuthUser>;
  completePartnerOnboarding: (input: PartnerOnboardingInput) => Promise<AuthUser>;
  updateUser: (patch: Partial<AuthUser>) => Promise<AuthUser>;
  /** Sets the session directly. Used by the demo-account rows on the login page. */
  setUser: (user: AuthUser, remember?: boolean) => void;
  /** Where this user should be right now, accounting for verification and onboarding. */
  destination: () => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useSyncExternalStore(subscribe, read, () => SERVER_SNAPSHOT);

  const adopt = useCallback((next: AuthUser, remember?: boolean) => { write(next, remember); return next; }, []);

  const login = useCallback(async (email: string, password: string, remember = true) => adopt(await authService.signIn(email, password), remember), [adopt]);
  const loginWithGoogle = useCallback(async (account: SocialAccount, role?: AuthUser["role"]) => adopt(await authService.signInWithGoogle(account, role)), [adopt]);
  const loginWithApple = useCallback(async (account: SocialAccount, role?: AuthUser["role"]) => adopt(await authService.signInWithApple(account, role)), [adopt]);
  const signup = useCallback(async (input: SignUpInput) => adopt(await authService.signUp(input)), [adopt]);
  const logout = useCallback(() => write(null), []);

  const verifyEmail = useCallback(async (code: string) => {
    if (!snapshot?.user) throw new Error("No one is signed in.");
    return adopt(await authService.verifyEmail(snapshot.user.id, code));
  }, [adopt]);

  const completeOnboarding = useCallback(async (input: CustomerOnboardingInput) => {
    if (!snapshot?.user) throw new Error("No one is signed in.");
    return adopt(await authService.completeCustomerOnboarding(snapshot.user.id, input));
  }, [adopt]);

  const completePartnerOnboarding = useCallback(async (input: PartnerOnboardingInput) => {
    if (!snapshot?.user) throw new Error("No one is signed in.");
    return adopt(await authService.completePartnerOnboarding(snapshot.user.id, input));
  }, [adopt]);

  const updateUser = useCallback(async (patch: Partial<AuthUser>) => {
    if (!snapshot?.user) throw new Error("No one is signed in.");
    return adopt(await authService.updateAccount(snapshot.user.id, patch));
  }, [adopt]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    persona: personaForUser(user),
    isAuthenticated: !!user,
    ready,
    login,
    loginWithGoogle,
    loginWithApple,
    signup,
    logout,
    verifyEmail,
    completeOnboarding,
    completePartnerOnboarding,
    updateUser,
    setUser: (u: AuthUser, remember?: boolean) => { write(u, remember); },
    destination: () => (user ? destinationForUser(user) : "/login"),
  }), [user, ready, login, loginWithGoogle, loginWithApple, signup, logout, verifyEmail, completeOnboarding, completePartnerOnboarding, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Sign in and send the user wherever they belong, in one call. */
export function useAuthRedirect() {
  const router = useRouter();
  const { destination } = useAuth();
  return useCallback((user: AuthUser, fallback?: string) => {
    router.push(fallback ?? destinationForUser(user));
    void destination;
  }, [router, destination]);
}
