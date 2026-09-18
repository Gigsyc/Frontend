import type { AttendanceMode, Event, EventCategory, RwandaPlace } from "@/types";

export const STEPS = [
  { id: "basics", label: "The basics" },
  { id: "when", label: "When & where" },
  { id: "entry", label: "Tickets & entry" },
  { id: "review", label: "Cover & review" },
] as const;

export const AGE_OPTIONS = ["", "16+", "18+", "21+"] as const;
export type AgeOption = (typeof AGE_OPTIONS)[number];

/** The two accessibility lines every partner is offered as checkboxes. */
export const ACCESSIBILITY_DEFAULTS = ["Step-free access to the main area", "Accessible toilets on site"];

/** Practical notes most events need; the partner can delete or rewrite them. */
export const GOOD_TO_KNOW_DEFAULTS = [
  "Arrive 20 minutes early — entry queues build close to the start time.",
  "Cash and mobile money are both accepted on site.",
];

export interface TierDraft {
  id: string;
  name: string;
  /** Kept as a string so the input stays controlled while typing. "0" means free. */
  price: string;
  description: string;
}

export interface SubmitState {
  step: number;
  /** Set once the form holds the content of the event being edited (?edit=). */
  editId: string | null;
  title: string;
  tagline: string;
  category: EventCategory | null;
  description: string;
  highlights: string[];
  date: string;
  multiDay: boolean;
  endDate: string;
  startTime: string;
  endTime: string;
  doorsOpen: string;
  venue: string;
  place: RwandaPlace | "";
  address: string;
  /** True once venue/address were filled from the organisation, so we only do it once. */
  venuePrefilled: boolean;
  ageRestriction: AgeOption;
  attendanceMode: AttendanceMode;
  tiers: TierDraft[];
  capacity: string;
  goodToKnow: string[];
  /** Which of ACCESSIBILITY_DEFAULTS are ticked. */
  accessibility: string[];
  /** Free-text accessibility lines beyond the defaults. */
  accessibilityExtra: string[];
  coverImage: string;
  gallery: string[];
  dirty: boolean;
  /** Show inline errors for the current step (after a failed Continue). */
  showErrors: boolean;
  /** True once sessionStorage has been read on the client. */
  hydrated: boolean;
}

let tierSeq = 0;
export const newTier = (name = "", price = ""): TierDraft => ({ id: `tier_${Date.now().toString(36)}_${tierSeq++}`, name, price, description: "" });

export const INITIAL_STATE: SubmitState = {
  step: 0,
  editId: null,
  title: "",
  tagline: "",
  category: null,
  description: "",
  highlights: [""],
  date: "",
  multiDay: false,
  endDate: "",
  startTime: "18:00",
  endTime: "22:00",
  doorsOpen: "",
  venue: "",
  place: "",
  address: "",
  venuePrefilled: false,
  ageRestriction: "",
  attendanceMode: "free",
  tiers: [newTier("General")],
  capacity: "",
  goodToKnow: [...GOOD_TO_KNOW_DEFAULTS],
  accessibility: [...ACCESSIBILITY_DEFAULTS],
  accessibilityExtra: [],
  coverImage: "",
  gallery: [],
  dirty: false,
  showErrors: false,
  hydrated: false,
};

export type SubmitAction =
  | { type: "set"; patch: Partial<SubmitState> }
  | { type: "goto"; step: number }
  | { type: "showErrors" }
  | { type: "hydrate"; state: SubmitState }
  | { type: "ready" }
  | { type: "prefill"; event: Event };

export function submitReducer(state: SubmitState, action: SubmitAction): SubmitState {
  switch (action.type) {
    case "set":
      return { ...state, ...action.patch, dirty: true };
    case "goto":
      return { ...state, step: Math.max(0, Math.min(STEPS.length - 1, action.step)), showErrors: false };
    case "showErrors":
      return { ...state, showErrors: true };
    case "hydrate":
      return { ...action.state, showErrors: false, hydrated: true };
    case "ready":
      return { ...state, hydrated: true };
    case "prefill":
      return { ...fromEvent(action.event), hydrated: true };
    default:
      return state;
  }
}

const isAge = (v: string | undefined): v is AgeOption => (AGE_OPTIONS as readonly string[]).includes(v ?? "");

/** Edit: load every field the partner can change. `dirty` stays false until they touch something. */
export function fromEvent(e: Event): SubmitState {
  return {
    ...INITIAL_STATE,
    editId: e.id,
    title: e.title,
    tagline: e.tagline,
    category: e.category,
    description: e.description,
    highlights: e.highlights.length ? [...e.highlights] : [""],
    date: e.date,
    multiDay: !!e.endDate && e.endDate !== e.date,
    endDate: e.endDate && e.endDate !== e.date ? e.endDate : "",
    startTime: e.startTime,
    endTime: e.endTime,
    doorsOpen: e.doorsOpen ?? "",
    venue: e.venue,
    place: e.place,
    address: e.address,
    venuePrefilled: true,
    ageRestriction: isAge(e.ageRestriction) ? e.ageRestriction : "",
    attendanceMode: e.attendanceMode,
    tiers: e.tickets.length
      ? e.tickets.map((t) => ({ id: t.id, name: t.name, price: String(t.price), description: t.description ?? "" }))
      : [newTier("General")],
    capacity: String(e.capacity),
    goodToKnow: [...e.goodToKnow],
    accessibility: ACCESSIBILITY_DEFAULTS.filter((a) => e.accessibility.includes(a)),
    accessibilityExtra: e.accessibility.filter((a) => !ACCESSIBILITY_DEFAULTS.includes(a)),
    coverImage: e.coverImage,
    gallery: [...e.gallery],
  };
}

/** One key per event so an edit in progress never bleeds into a new listing, or another edit. */
const storageKey = (editId: string | undefined) => `gigsyc.submitEvent.v1:${editId ?? "new"}`;

export function loadDraft(editId: string | undefined): SubmitState | null {
  try {
    const raw = window.sessionStorage.getItem(storageKey(editId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SubmitState>;
    return { ...INITIAL_STATE, ...parsed };
  } catch {
    return null;
  }
}

export function saveDraft(editId: string | undefined, state: SubmitState) {
  try {
    window.sessionStorage.setItem(storageKey(editId), JSON.stringify(state));
  } catch {
    /* storage unavailable — the form still works for this session */
  }
}

export function clearDraft(editId: string | undefined) {
  try {
    window.sessionStorage.removeItem(storageKey(editId));
  } catch {
    /* ignore */
  }
}
