import type { KigaliDistrict, Language, RoleCategory, Worker } from "@/types";

export type Experience = "new" | "lt1" | "1to3" | "3plus";
export type TravelRadius = "home" | "kigali" | "travel";
export type UploadKey = "idFront" | "selfie";

export interface AboutState { firstName: string; lastName: string; phone: string; district: KigaliDistrict | ""; languages: Language[] }
export interface SkillsState { roles: RoleCategory[]; primary: RoleCategory | null; experience: Experience | null; headline: string }
export interface AvailabilityState { windows: Worker["availability"]; minPay: string; radius: TravelRadius | "" }
export interface VerifyState { idFront: boolean; selfie: boolean }

export interface OnboardingState {
  step: number;
  about: AboutState;
  skills: SkillsState;
  availability: AvailabilityState;
  verify: VerifyState;
  agreed: boolean;
  submitted: boolean;
  /** False until the sessionStorage draft has been read on the client. Never persisted. */
  hydrated: boolean;
}

export const MAX_ROLES = 4;
export const HEADLINE_MAX = 80;

export const INITIAL_STATE: OnboardingState = {
  step: 0,
  about: { firstName: "", lastName: "", phone: "", district: "", languages: [] },
  skills: { roles: [], primary: null, experience: null, headline: "" },
  availability: { windows: { weekdays: false, weekends: false, evenings: false, overnight: false }, minPay: "", radius: "" },
  verify: { idFront: false, selfie: false },
  agreed: false,
  submitted: false,
  hydrated: false,
};

export type Action =
  | { type: "hydrate"; state: Omit<OnboardingState, "hydrated"> }
  | { type: "goto"; step: number }
  | { type: "patchAbout"; patch: Partial<AboutState> }
  | { type: "toggleLanguage"; language: Language }
  | { type: "patchSkills"; patch: Partial<SkillsState> }
  | { type: "toggleRole"; role: RoleCategory }
  | { type: "setPrimary"; role: RoleCategory }
  | { type: "patchAvailability"; patch: Partial<AvailabilityState> }
  | { type: "toggleWindow"; key: keyof Worker["availability"]; on: boolean }
  | { type: "uploaded"; key: UploadKey }
  | { type: "setAgreed"; on: boolean }
  | { type: "submitted" }
  | { type: "reset" };

export function reducer(s: OnboardingState, a: Action): OnboardingState {
  switch (a.type) {
    case "hydrate": return { ...a.state, hydrated: true };
    case "goto": return { ...s, step: a.step };
    case "patchAbout": return { ...s, about: { ...s.about, ...a.patch } };
    case "toggleLanguage": {
      const has = s.about.languages.includes(a.language);
      return { ...s, about: { ...s.about, languages: has ? s.about.languages.filter((l) => l !== a.language) : [...s.about.languages, a.language] } };
    }
    case "patchSkills": return { ...s, skills: { ...s.skills, ...a.patch } };
    case "toggleRole": {
      const has = s.skills.roles.includes(a.role);
      if (!has && s.skills.roles.length >= MAX_ROLES) return s;
      const roles = has ? s.skills.roles.filter((r) => r !== a.role) : [...s.skills.roles, a.role];
      // Primary follows the list: first pick becomes primary; removing the primary hands it to the next role.
      const primary = roles.includes(s.skills.primary as RoleCategory) ? s.skills.primary : roles[0] ?? null;
      return { ...s, skills: { ...s.skills, roles, primary } };
    }
    case "setPrimary": return s.skills.roles.includes(a.role) ? { ...s, skills: { ...s.skills, primary: a.role } } : s;
    case "patchAvailability": return { ...s, availability: { ...s.availability, ...a.patch } };
    case "toggleWindow": return { ...s, availability: { ...s.availability, windows: { ...s.availability.windows, [a.key]: a.on } } };
    case "uploaded": return { ...s, verify: { ...s.verify, [a.key]: true } };
    case "setAgreed": return { ...s, agreed: a.on };
    case "submitted": return { ...s, submitted: true };
    case "reset": return { ...INITIAL_STATE, hydrated: true };
  }
}

const STORAGE_KEY = "gigsyc.onboarding.draft";

export function loadDraft(): OnboardingState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    // Merge over the initial shape so a stale draft from an older build can't crash the wizard.
    return {
      ...INITIAL_STATE,
      ...parsed,
      about: { ...INITIAL_STATE.about, ...parsed.about },
      skills: { ...INITIAL_STATE.skills, ...parsed.skills },
      availability: { ...INITIAL_STATE.availability, ...parsed.availability, windows: { ...INITIAL_STATE.availability.windows, ...parsed.availability?.windows } },
      verify: { ...INITIAL_STATE.verify, ...parsed.verify },
    };
  } catch {
    return null;
  }
}

export function saveDraft(state: OnboardingState) {
  // `undefined` is dropped by JSON.stringify, so the flag never reaches storage.
  try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, hydrated: undefined })); } catch { /* private mode or full — the wizard still works, it just won't survive a refresh */ }
}

export function clearDraft() {
  try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
