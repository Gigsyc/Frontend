import { INTERESTS, DISCOVERY_PREFERENCES } from "@/data/auth";
import { PLACES } from "@/data/events";
import type {
  CustomerOnboardingInput, DiscoveryPreferenceId, Event, InterestId, RwandaPlace,
} from "@/types";

/**
 * Customer onboarding is three questions: a greeting, a place, a set of interests.
 * The preference question is a bonus at the end, never a fourth requirement — which is
 * why the progress bar reads "1 of 3" until someone actually opens it.
 */
export const CORE_STEPS = 3;
export const PREFERENCE_STEP = 3;
export const MIN_INTERESTS = 3;

/**
 * "Somewhere else" saves Kigali — the store only understands real places — but the tile the
 * person pressed stays the selected one, so the screen never claims a choice they didn't make.
 */
export type LocationChoice = RwandaPlace | "anywhere";

/** What each step needs from the public events query: counts on step two, covers on step one. */
export interface EventsSummary {
  list: Event[] | undefined;
  pending: boolean;
  error: boolean;
  retry: () => void;
}

export interface CustomerOnboardingState {
  step: number;
  selection: LocationChoice | null;
  interests: InterestId[];
  preference: DiscoveryPreferenceId | null;
  /** False until the saved draft has been read on the client. Never persisted. */
  hydrated: boolean;
  /** Whose answers these are. Null until hydrated; never persisted (the key carries it). */
  userId: string | null;
}

export const INITIAL_STATE: CustomerOnboardingState = {
  step: 0,
  selection: null,
  interests: [],
  preference: null,
  hydrated: false,
  userId: null,
};

export type Action =
  | { type: "hydrate"; state: CustomerOnboardingState }
  | { type: "goto"; step: number }
  | { type: "selectLocation"; selection: LocationChoice }
  | { type: "setInterests"; interests: InterestId[] }
  | { type: "setPreference"; preference: DiscoveryPreferenceId };

export function reducer(s: CustomerOnboardingState, a: Action): CustomerOnboardingState {
  switch (a.type) {
    case "hydrate": return { ...a.state, hydrated: true };
    case "goto": return { ...s, step: Math.max(0, Math.min(PREFERENCE_STEP, a.step)) };
    case "selectLocation": return { ...s, selection: a.selection };
    case "setInterests": return { ...s, interests: a.interests };
    case "setPreference": return { ...s, preference: a.preference };
  }
}

/** The place we actually save. Null until someone has answered. */
export function placeFor(selection: LocationChoice | null): RwandaPlace | null {
  if (!selection) return null;
  return selection === "anywhere" ? "Kigali" : selection;
}

export function firstNameOf(name: string | undefined): string {
  return (name ?? "").trim().split(/\s+/)[0] || "there";
}

function joinWords(words: string[]): string {
  if (words.length <= 1) return words[0] ?? "";
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/**
 * A snapshot of what was actually sent. The confirmation panel reads this and never the live
 * reducer, so nothing typed after "Finish" can change the sentence describing the saved record.
 */
export interface SavedOnboarding {
  input: CustomerOnboardingInput;
  /** "Somewhere else" was chosen. The record still says Kigali, so the copy must not claim more. */
  anywhere: boolean;
  /** The total the progress bar showed on the last step, so the bar doesn't jump at the end. */
  total: number;
}

/** One plain line naming what was saved, shown on the confirmation panel. */
export function summaryLine(saved: SavedOnboarding): string {
  // The record holds one place either way, so "anywhere" promises a starting point, not coverage.
  const where = saved.anywhere
    ? "Events from around Rwanda, starting near Kigali"
    : `Events near ${saved.input.location}`;
  const labels = saved.input.interests.slice(0, 3).map((i) => INTERESTS[i].label.toLowerCase());
  return labels.length ? `${where}, starting with ${joinWords(labels)}.` : `${where}.`;
}

const isLocationChoice = (v: unknown): v is LocationChoice =>
  v === "anywhere" || (typeof v === "string" && (PLACES as string[]).includes(v));
const isInterestId = (v: unknown): v is InterestId => typeof v === "string" && v in INTERESTS;
const isPreferenceId = (v: unknown): v is DiscoveryPreferenceId => typeof v === "string" && v in DISCOVERY_PREFERENCES;

/** A stale draft must not drop someone on a question their remaining answers no longer support. */
function clampStep(step: unknown, selection: LocationChoice | null, interests: InterestId[]): number {
  const max = selection === null ? 1 : interests.length < MIN_INTERESTS ? 2 : PREFERENCE_STEP;
  const n = typeof step === "number" && Number.isFinite(step) ? Math.round(step) : 0;
  return Math.max(0, Math.min(max, n));
}

/**
 * One draft per account. Sign out mid-flow and sign in as someone else in the same tab and the
 * new person must start at question one — never on step three holding answers they never gave.
 */
const draftKey = (userId: string) => `gigsyc.onboarding.customer:${userId}`;

/**
 * Answers survive a refresh but not a new session — onboarding is a single sitting.
 * Every field is re-validated because a draft written by an older build is untrusted input.
 */
export function loadDraft(userId: string): CustomerOnboardingState {
  const empty: CustomerOnboardingState = { ...INITIAL_STATE, hydrated: true, userId };
  try {
    const raw = window.sessionStorage.getItem(draftKey(userId));
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const selection = isLocationChoice(parsed.selection) ? parsed.selection : null;
    const interests = Array.isArray(parsed.interests) ? parsed.interests.filter(isInterestId) : [];
    return {
      step: clampStep(parsed.step, selection, interests),
      selection,
      interests,
      preference: isPreferenceId(parsed.preference) ? parsed.preference : null,
      hydrated: true,
      userId,
    };
  } catch {
    return empty;
  }
}

export function saveDraft(state: CustomerOnboardingState) {
  const { step, selection, interests, preference, userId } = state;
  if (!userId) return;
  // Private mode or a full quota: the flow still works, it just won't survive a refresh.
  try {
    window.sessionStorage.setItem(draftKey(userId), JSON.stringify({ step, selection, interests, preference }));
  } catch { /* ignore */ }
}

export function clearDraft(userId: string) {
  try { window.sessionStorage.removeItem(draftKey(userId)); } catch { /* ignore */ }
}
