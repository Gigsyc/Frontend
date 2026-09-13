import { ORGANIZATION_TYPES } from "@/data/auth";
import { PLACES } from "@/data/events";
import type { OrganizationType, RwandaPlace } from "@/types";
import { normaliseRwMobile } from "@/lib/utils";

/** Everything the three steps collect, in the shape `completePartnerOnboarding` wants. */
export interface PartnerOnboardingState {
  step: number;
  organizationName: string;
  organizationType: OrganizationType | null;
  contactName: string;
  /** The nine digits after +250. The prefix is chrome inside the field, never stored here. */
  phone: string;
  place: RwandaPlace | null;
  /** False until the saved draft has been read on the client. Never persisted. */
  hydrated: boolean;
  /** Whose answers these are. Null until hydrated; never persisted (the key carries it). */
  userId: string | null;
}

export const TOTAL_STEPS = 3;

export type PartnerDraft = Omit<PartnerOnboardingState, "hydrated" | "userId">;

export const INITIAL_DRAFT: PartnerDraft = {
  step: 0,
  organizationName: "",
  organizationType: null,
  contactName: "",
  phone: "",
  place: null,
};

export const INITIAL_STATE: PartnerOnboardingState = { ...INITIAL_DRAFT, hydrated: false, userId: null };

export type Action =
  | { type: "hydrate"; state: PartnerDraft; userId: string }
  | { type: "goto"; step: number }
  | { type: "patch"; patch: Partial<PartnerDraft> };

/** The only place a step number is allowed to become the state's step. */
const clampStep = (step: unknown): number => {
  const n = typeof step === "number" && Number.isFinite(step) ? Math.round(step) : 0;
  return Math.min(Math.max(n, 0), TOTAL_STEPS - 1);
};

export function reducer(s: PartnerOnboardingState, a: Action): PartnerOnboardingState {
  switch (a.type) {
    // Clamped here as well as in "goto": a restored draft is untrusted input, and a step
    // past the last question would render the shell with no body and a bar reading "4 of 3".
    case "hydrate": return { ...a.state, step: clampStep(a.state.step), hydrated: true, userId: a.userId };
    case "goto": return { ...s, step: clampStep(a.step) };
    case "patch": return { ...s, ...a.patch };
  }
}

export type StepErrors = Partial<Record<"organizationName" | "organizationType" | "contactName" | "phone" | "place", string>>;

/** Nine digits after +250 — the country code is shown, so it is never typed. */
export const phoneDigits = (raw: string) => normaliseRwMobile(raw).slice(0, 9);

export function validateStep(step: number, s: PartnerDraft): StepErrors {
  const errors: StepErrors = {};
  if (step === 0) {
    if (s.organizationName.trim().length < 2) errors.organizationName = "Enter the name people will see on your events — at least two characters.";
    if (!s.organizationType) errors.organizationType = "Pick the description that fits best.";
  }
  if (step === 1) {
    if (s.contactName.trim().length < 2) errors.contactName = "Tell us who to ask for.";
    if (phoneDigits(s.phone).length !== 9) errors.phone = "Enter the nine digits after +250, like 788 123 456.";
  }
  if (step === 2 && !s.place) errors.place = "Choose the city you work from.";
  return errors;
}

/** The furthest question the answers in a draft actually support. */
function furthestStep(draft: PartnerDraft): number {
  for (let step = 0; step < TOTAL_STEPS - 1; step += 1) {
    if (Object.keys(validateStep(step, draft)).length > 0) return step;
  }
  return TOTAL_STEPS - 1;
}

const isOrganizationType = (v: unknown): v is OrganizationType => typeof v === "string" && v in ORGANIZATION_TYPES;
const isPlace = (v: unknown): v is RwandaPlace => typeof v === "string" && (PLACES as string[]).includes(v);
/** Storage is text a person can edit, so a field is either a sane string or empty. */
const asText = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

/**
 * One draft per account. Sign out mid-setup and sign in as someone else in the same tab and
 * the next person must start empty — never holding the previous partner's organisation name,
 * contact and phone number.
 */
const draftKey = (userId: string) => `gigsyc.partner-onboarding.draft:${userId}`;

/**
 * Answers survive a refresh but not a new session — setup is a single sitting.
 * Every field is re-validated because a draft written by an older build is untrusted input:
 * an unknown organisation type or place would otherwise be handed straight to the store.
 */
export function loadDraft(userId: string): PartnerDraft {
  try {
    const raw = window.sessionStorage.getItem(draftKey(userId));
    if (!raw) return INITIAL_DRAFT;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const draft: PartnerDraft = {
      step: 0,
      organizationName: asText(parsed.organizationName, 120),
      organizationType: isOrganizationType(parsed.organizationType) ? parsed.organizationType : null,
      contactName: asText(parsed.contactName, 120),
      phone: phoneDigits(asText(parsed.phone, 24)),
      place: isPlace(parsed.place) ? parsed.place : null,
    };
    return { ...draft, step: Math.min(clampStep(parsed.step), furthestStep(draft)) };
  } catch {
    return INITIAL_DRAFT;
  }
}

export function saveDraft(state: PartnerOnboardingState) {
  const { step, organizationName, organizationType, contactName, phone, place, userId } = state;
  if (!userId) return;
  // Private mode or a full quota: the wizard still works, it just won't survive a refresh.
  try {
    window.sessionStorage.setItem(draftKey(userId), JSON.stringify({ step, organizationName, organizationType, contactName, phone, place }));
  } catch { /* ignore */ }
}

export function clearDraft(userId: string) {
  try { window.sessionStorage.removeItem(draftKey(userId)); } catch { /* ignore */ }
}

/** "788123456" → "788 123 456". Display grouping only. */
export const groupPhone = (digits: string) => digits.replace(/(\d{3})(?=\d)/g, "$1 ");

/** Stored on the organisation as "+250 788 123 456", matching the seeded partner records. */
export const fullPhone = (digits: string) => `+250 ${groupPhone(digits)}`.trim();
