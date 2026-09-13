import { EMPLOYER_USERS } from "@/data/mocks/employers";
import { PLATFORM_USERS } from "@/data/mocks/platform";
import { DEMO_PERSONAS } from "@/features/session";
import type { Persona } from "@/types";

/** The `?as=` values the marketing pages and the account menu link with. */
export type LoginHint = "customer" | "organizer" | "worker" | "admin";

export interface DemoAccount {
  id: LoginHint;
  persona: Persona;
  name: string;
  email: string;
  /** Muted second line: who this person is on the platform. */
  role: string;
  /** Plain-words destination, used in the sign-in toast. */
  landing: string;
  avatarColor: string;
  /** Set when the account runs an organisation, so the row can show its mark. */
  employerId?: string;
}

interface AccountSpec extends Omit<DemoAccount, "name" | "email" | "avatarColor"> {
  /** Work address, when the person signs in with an organisation account rather than a personal one. */
  email?: string;
}

const diane = EMPLOYER_USERS.find((u) => u.id === DEMO_PERSONAS.organizer.userId);

const SPECS: AccountSpec[] = [
  {
    id: "customer", persona: DEMO_PERSONAS.customer,
    role: "Explorer · discovers events", landing: "events around Rwanda",
  },
  {
    id: "organizer", persona: DEMO_PERSONAS.organizer, email: diane?.email,
    role: "Partner · Ikaze Hospitality Group", landing: "the Ikaze workspace",
    employerId: DEMO_PERSONAS.organizer.employerId,
  },
  {
    id: "worker", persona: DEMO_PERSONAS.worker,
    role: "Professional · works shifts", landing: "your shifts and earnings",
  },
  {
    id: "admin", persona: DEMO_PERSONAS.admin,
    role: "Platform admin · GigSyc operations", landing: "the admin console",
  },
];

/**
 * The platform-user record behind a persona. A customer or admin signs in as their own
 * account id; a professional and an organisation contact are linked to theirs, so the
 * row is resolved through the link rather than by naming an id here.
 */
function platformUserFor(persona: Persona) {
  return PLATFORM_USERS.find((u) =>
    persona.role === "worker" ? u.linkedWorkerId === persona.userId
      : persona.role === "employer" ? u.linkedEmployerId === persona.employerId
        : u.id === persona.userId);
}

/**
 * Names, emails and avatar colours are read from the platform user records so the login
 * page can never drift from the people the admin console lists.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = SPECS.flatMap(({ email, ...spec }) => {
  const user = platformUserFor(spec.persona);
  return user ? [{ ...spec, name: user.name, email: email ?? user.email, avatarColor: user.avatarColor }] : [];
});

/** An unrecognised email still gets in — as the customer, the least privileged persona. */
export const FALLBACK_ACCOUNT: DemoAccount | undefined =
  DEMO_ACCOUNTS.find((a) => a.id === "customer") ?? DEMO_ACCOUNTS[0];

/** `?as=employer` and `?as=organizer` both point at Diane: one record, two vocabularies. */
export function accountForHint(hint: string | null): DemoAccount | undefined {
  if (!hint) return undefined;
  const id = hint === "employer" ? "organizer" : hint;
  return DEMO_ACCOUNTS.find((a) => a.id === id);
}

export function accountForEmail(email: string): DemoAccount | undefined {
  const needle = email.trim().toLowerCase();
  return needle ? DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === needle) : undefined;
}
