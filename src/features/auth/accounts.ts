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

/** Everything the login page states itself; name, email and colour come from the platform user. */
type AccountSpec = Omit<DemoAccount, "name" | "email" | "avatarColor">;

const SPECS: AccountSpec[] = [
  {
    id: "customer", persona: DEMO_PERSONAS.customer,
    role: "Explorer · discovers events", landing: "events around Rwanda",
  },
  {
    id: "organizer", persona: DEMO_PERSONAS.organizer,
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
 * page can never drift from the people the admin console lists. A seed id that stops
 * resolving fails here rather than quietly removing a way into the prototype.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = SPECS.map((spec) => {
  const user = platformUserFor(spec.persona);
  if (!user) {
    throw new Error(`No platform user is linked to the "${spec.id}" demo account — check the seed ids in data/mocks/platform.ts.`);
  }
  return { ...spec, name: user.name, email: user.email, avatarColor: user.avatarColor };
});

/** `?as=employer` and `?as=organizer` both point at Diane: one record, two vocabularies. */
export function accountForHint(hint: string | null | undefined): DemoAccount | undefined {
  if (!hint) return undefined;
  const id = hint === "employer" ? "organizer" : hint;
  return DEMO_ACCOUNTS.find((a) => a.id === id);
}

export function accountForEmail(email: string): DemoAccount | undefined {
  const needle = email.trim().toLowerCase();
  return needle ? DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === needle) : undefined;
}
