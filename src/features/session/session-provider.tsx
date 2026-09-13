"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { Persona } from "@/types";
import { DEMO_ADMIN_ID, DEMO_CUSTOMER_ID, DEMO_EMPLOYER_ID, DEMO_EMPLOYER_USER_ID, DEMO_WORKER_ID } from "@/data/mocks/seed";

const KEY = "gigsyc.prototype.session";

/**
 * The four ways into the prototype. "organizer" is the same persona as "employer" —
 * partners who run events are the same organisations that hire staff — but the login
 * presents it in the language a partner would recognise.
 */
export const DEMO_PERSONAS = {
  customer: { role: "customer", userId: DEMO_CUSTOMER_ID },
  organizer: { role: "employer", userId: DEMO_EMPLOYER_USER_ID, employerId: DEMO_EMPLOYER_ID },
  employer: { role: "employer", userId: DEMO_EMPLOYER_USER_ID, employerId: DEMO_EMPLOYER_ID },
  worker: { role: "worker", userId: DEMO_WORKER_ID },
  admin: { role: "admin", userId: DEMO_ADMIN_ID },
} satisfies Record<string, Persona>;

/** Where each role lands after signing in. */
export const HOME_FOR_ROLE: Record<Persona["role"], string> = {
  customer: "/events",
  employer: "/employer",
  worker: "/worker",
  admin: "/admin",
};

interface SessionContextValue {
  persona: Persona | null;
  /** True until localStorage has been read on the client. */
  ready: boolean;
  signIn: (persona: Persona) => void;
  signOut: () => void;
}

/**
 * Tiny external store for the persisted persona. Reading localStorage through
 * useSyncExternalStore keeps server and first client render identical (persona null,
 * ready false) and avoids setting state inside an effect.
 */
interface SessionSnapshot { persona: Persona | null; ready: boolean }
const SERVER_SNAPSHOT: SessionSnapshot = { persona: null, ready: false };
let snapshot: SessionSnapshot | null = null;
const listeners = new Set<() => void>();

function readSnapshot(): SessionSnapshot {
  if (!snapshot) {
    let persona: Persona | null = null;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) persona = JSON.parse(raw) as Persona;
    } catch { /* ignore */ }
    snapshot = { persona, ready: true };
  }
  return snapshot;
}

function writePersona(persona: Persona | null) {
  snapshot = { persona, ready: true };
  try {
    if (persona) window.localStorage.setItem(KEY, JSON.stringify(persona));
    else window.localStorage.removeItem(KEY);
  } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { persona, ready } = useSyncExternalStore(subscribe, readSnapshot, () => SERVER_SNAPSHOT);

  const signIn = useCallback((p: Persona) => writePersona(p), []);
  const signOut = useCallback(() => writePersona(null), []);

  const value = useMemo(() => ({ persona, ready, signIn, signOut }), [persona, ready, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}

/**
 * Convenience for app shells: returns the active persona for a role, falling back to the demo
 * persona so deep links work in the prototype even without visiting /login.
 */
type EmployerPersona = Extract<Persona, { role: "employer" }>;
type WorkerPersona = Extract<Persona, { role: "worker" }>;

export function useEmployerSession() {
  const { persona, ...rest } = useSession();
  const p: EmployerPersona = persona?.role === "employer" ? persona : (DEMO_PERSONAS.employer as EmployerPersona);
  return { ...rest, persona: p, employerId: p.employerId };
}

export function useWorkerSession() {
  const { persona, ...rest } = useSession();
  const p: WorkerPersona = persona?.role === "worker" ? persona : (DEMO_PERSONAS.worker as WorkerPersona);
  return { ...rest, persona: p, workerId: p.userId };
}

type CustomerPersona = Extract<Persona, { role: "customer" }>;
type AdminPersona = Extract<Persona, { role: "admin" }>;

export function useCustomerSession() {
  const { persona, ...rest } = useSession();
  const p: CustomerPersona = persona?.role === "customer" ? persona : (DEMO_PERSONAS.customer as CustomerPersona);
  return { ...rest, persona: p, userId: p.userId, signedIn: persona?.role === "customer" };
}

export function useAdminSession() {
  const { persona, ...rest } = useSession();
  const p: AdminPersona = persona?.role === "admin" ? persona : (DEMO_PERSONAS.admin as AdminPersona);
  return { ...rest, persona: p, userId: p.userId };
}
