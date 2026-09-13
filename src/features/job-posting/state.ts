import type { KigaliDistrict, RoleCategory, Shift } from "@/types";

export type PostTo = "everyone" | "pool";

export const STEPS = [
  { id: "role", label: "Role & headcount" },
  { id: "when", label: "When & where" },
  { id: "pay", label: "Pay & details" },
  { id: "review", label: "Review" },
] as const;

export interface WizardState {
  step: number;
  /** Set when the wizard was prefilled from an existing shift (Duplicate / Edit draft). */
  fromId: string | null;
  role: RoleCategory | null;
  title: string;
  /** True once the employer typed a title themselves; stops auto-suggestion. */
  titleTouched: boolean;
  workersNeeded: number;
  postTo: PostTo;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  venue: string;
  district: KigaliDistrict | "";
  address: string;
  supervisorName: string;
  supervisorPhone: string;
  supervisorPrefilled: boolean;
  checkInMethod: Shift["checkInMethod"];
  /** Kept as strings so the inputs stay controlled while typing. */
  pay: string;
  transport: string;
  mealProvided: boolean;
  dressCode: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  urgent: boolean;
  dirty: boolean;
  /** Show inline errors for the current step (after a failed Continue). */
  showErrors: boolean;
  /** True once sessionStorage has been read on the client. */
  hydrated: boolean;
}

export const INITIAL_STATE: WizardState = {
  step: 0,
  fromId: null,
  role: null,
  title: "",
  titleTouched: false,
  workersNeeded: 4,
  postTo: "everyone",
  date: "",
  startTime: "08:00",
  endTime: "16:00",
  breakMinutes: 30,
  venue: "",
  district: "",
  address: "",
  supervisorName: "",
  supervisorPhone: "",
  supervisorPrefilled: false,
  checkInMethod: "qr",
  pay: "",
  transport: "",
  mealProvided: false,
  dressCode: "",
  description: "",
  responsibilities: [""],
  requirements: [],
  urgent: false,
  dirty: false,
  showErrors: false,
  hydrated: false,
};

export type WizardAction =
  | { type: "set"; patch: Partial<WizardState> }
  | { type: "goto"; step: number }
  | { type: "showErrors" }
  | { type: "hydrate"; state: WizardState }
  | { type: "ready" }
  | { type: "prefill"; shift: Shift; fromId: string }
  | { type: "detachSource" }
  | { type: "reset" };

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
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
      return { ...fromShift(action.shift, action.fromId), hydrated: true };
    case "detachSource":
      // The ?from= shift couldn't be loaded — stop treating this as an edit of it.
      return state.fromId === null ? state : { ...state, fromId: null };
    case "reset":
      return INITIAL_STATE;
    default:
      return state;
  }
}

/** Duplicate: copy everything except the date — the old one is probably gone. */
export function fromShift(s: Shift, fromId: string): WizardState {
  return {
    ...INITIAL_STATE,
    fromId,
    role: s.role,
    title: s.title,
    titleTouched: true,
    workersNeeded: s.workersNeeded,
    date: s.status === "draft" ? s.date : "",
    startTime: s.startTime,
    endTime: s.endTime,
    breakMinutes: s.breakMinutes,
    venue: s.venue,
    district: s.district,
    address: s.address,
    supervisorName: s.supervisor.name,
    supervisorPhone: s.supervisor.phone,
    supervisorPrefilled: true,
    checkInMethod: s.checkInMethod,
    pay: String(s.payPerShift),
    transport: s.transportAllowance ? String(s.transportAllowance) : "",
    mealProvided: s.mealProvided,
    dressCode: s.dressCode ?? "",
    description: s.description,
    responsibilities: s.responsibilities.length ? [...s.responsibilities] : [""],
    requirements: [...s.requirements],
    urgent: s.urgent,
    dirty: true,
  };
}

const STORAGE_KEY = "gigsyc.postShift.v1";

export function loadDraft(): WizardState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WizardState>;
    return { ...INITIAL_STATE, ...parsed };
  } catch {
    return null;
  }
}

export function saveDraft(state: WizardState) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — the form still works for this session */
  }
}

export function clearDraft() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
