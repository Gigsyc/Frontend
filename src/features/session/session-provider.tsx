"use client";

/**
 * Session compatibility layer.
 *
 * The workforce product was built on `Persona`. Identity now lives in
 * `features/auth`, so these hooks derive from the signed-in user rather than
 * holding their own state. Nothing here stores anything.
 *
 * New code should use `useAuth()` directly.
 */
import { useMemo } from "react";
import type { Persona } from "@/types";
import { AuthProvider, useAuth } from "@/features/auth/auth-provider";
import { DEMO_ACCOUNT_IDS } from "@/data/mocks/accounts";
import { DEMO_ADMIN_ID, DEMO_CUSTOMER_ID, DEMO_EMPLOYER_ID, DEMO_EMPLOYER_USER_ID, DEMO_WORKER_ID } from "@/data/mocks/seed";
import { ROLE_HOME } from "@/data/auth";

/** @deprecated Use <AuthProvider>. Kept so existing imports keep compiling. */
export const SessionProvider = AuthProvider;

/** Personas for the four demo accounts, used by the login page. */
export const DEMO_PERSONAS = {
  customer: { role: "customer", userId: DEMO_CUSTOMER_ID },
  organizer: { role: "employer", userId: DEMO_EMPLOYER_USER_ID, employerId: DEMO_EMPLOYER_ID },
  employer: { role: "employer", userId: DEMO_EMPLOYER_USER_ID, employerId: DEMO_EMPLOYER_ID },
  worker: { role: "worker", userId: DEMO_WORKER_ID },
  admin: { role: "admin", userId: DEMO_ADMIN_ID },
} satisfies Record<string, Persona>;

export { DEMO_ACCOUNT_IDS };

/** Where each persona role lands. Roles map onto ROLE_HOME, with partner == employer. */
export const HOME_FOR_ROLE: Record<Persona["role"], string> = {
  customer: ROLE_HOME.customer,
  employer: "/employer",
  worker: ROLE_HOME.worker,
  admin: ROLE_HOME.admin,
};

export function useSession() {
  const { persona, ready, user, logout, setUser } = useAuth();
  return useMemo(() => ({
    persona,
    ready,
    user,
    signIn: (_p: Persona) => {
      // Personas are derived from the account now; signing in goes through useAuth().
      void _p;
    },
    signOut: logout,
    setUser,
  }), [persona, ready, user, logout, setUser]);
}

type EmployerPersona = Extract<Persona, { role: "employer" }>;
type WorkerPersona = Extract<Persona, { role: "worker" }>;
type CustomerPersona = Extract<Persona, { role: "customer" }>;
type AdminPersona = Extract<Persona, { role: "admin" }>;

/**
 * Each of these falls back to the matching demo persona so a deep link into the
 * employer portal or worker app still renders for someone who has not signed in —
 * the prototype stays explorable without a login wall on every page.
 */
export function useEmployerSession() {
  const { persona, ready, logout } = useAuth();
  const p: EmployerPersona = persona?.role === "employer" ? persona : (DEMO_PERSONAS.employer as EmployerPersona);
  return { persona: p, ready, employerId: p.employerId, signOut: logout };
}

export function useWorkerSession() {
  const { persona, ready, logout } = useAuth();
  const p: WorkerPersona = persona?.role === "worker" ? persona : (DEMO_PERSONAS.worker as WorkerPersona);
  return { persona: p, ready, workerId: p.userId, signOut: logout };
}

export function useCustomerSession() {
  const { persona, ready, logout } = useAuth();
  const p: CustomerPersona = persona?.role === "customer" ? persona : (DEMO_PERSONAS.customer as CustomerPersona);
  return { persona: p, ready, userId: p.userId, signedIn: persona?.role === "customer", signOut: logout };
}

export function useAdminSession() {
  const { persona, ready, logout } = useAuth();
  const p: AdminPersona = persona?.role === "admin" ? persona : (DEMO_PERSONAS.admin as AdminPersona);
  return { persona: p, ready, userId: p.userId, signOut: logout };
}
