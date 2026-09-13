import { RW_MOBILE_RE, normaliseRwMobile } from "@/lib/utils";
import type { Experience, OnboardingState, TravelRadius } from "./state";
import { HEADLINE_MAX } from "./state";

export type StepId = "about" | "skills" | "availability" | "verify" | "review";

export const STEPS: Array<{ id: StepId; label: string; title: string; description: string }> = [
  { id: "about", label: "About you", title: "Tell us who you are", description: "Your name should match your National ID — employers and payouts use it." },
  { id: "skills", label: "Skills", title: "What can you be booked for?", description: "Pick up to four roles. Your primary role is what we match you on most." },
  { id: "availability", label: "Availability", title: "When and where you can work", description: "We only send shifts that fit these. You can change them any time." },
  { id: "verify", label: "Verify", title: "Verify your identity", description: "Verified workers appear first in searches and get confirmed faster." },
  { id: "review", label: "Review", title: "Check everything", description: "You can edit any step before you submit." },
];

export const stepIndex = (id: string | null | undefined) => Math.max(0, STEPS.findIndex((s) => s.id === id));

export const EXPERIENCE_OPTIONS: Array<{ value: Experience; label: string; hint: string }> = [
  { value: "new", label: "New", hint: "No paid shifts yet" },
  { value: "lt1", label: "< 1 yr", hint: "A few months in" },
  { value: "1to3", label: "1–3 yrs", hint: "Regular shifts" },
  { value: "3plus", label: "3+ yrs", hint: "Experienced" },
];

export const RADIUS_OPTIONS: Array<{ value: TravelRadius; label: string; hint: string }> = [
  { value: "home", label: "My district only", hint: "Shifts within walking or a short moto ride" },
  { value: "kigali", label: "Anywhere in Kigali", hint: "Most shifts are in Kimihurura, Kacyiru and Nyarutarama" },
  { value: "travel", label: "Willing to travel", hint: "Includes overnight events in Musanze, Rubavu and Bugesera" },
];

export type StepErrors = Record<string, string>;

export function validateStep(id: StepId, s: OnboardingState): StepErrors {
  const e: StepErrors = {};
  if (id === "about") {
    if (s.about.firstName.trim().length < 2) e.firstName = "Enter your first name.";
    if (s.about.lastName.trim().length < 2) e.lastName = "Enter your last name as it appears on your ID.";
    if (!RW_MOBILE_RE.test(normaliseRwMobile(s.about.phone))) e.phone = "Enter a Rwandan mobile number, e.g. 788 123 456.";
    if (!s.about.district) e.district = "Pick the district you live in.";
    if (s.about.languages.length === 0) e.languages = "Pick at least one language.";
  }
  if (id === "skills") {
    if (s.skills.roles.length === 0) e.roles = "Pick at least one role.";
    if (!s.skills.experience) e.experience = "How much experience do you have?";
    if (s.skills.headline.trim().length < 10) e.headline = "A short line about you — at least 10 characters.";
    else if (s.skills.headline.length > HEADLINE_MAX) e.headline = `Keep it under ${HEADLINE_MAX} characters.`;
  }
  if (id === "availability") {
    if (!Object.values(s.availability.windows).some(Boolean)) e.windows = "Switch on at least one window, or we can't send you shifts.";
    const n = Number(s.availability.minPay);
    if (!s.availability.minPay.trim() || !Number.isFinite(n) || n < 5000 || n > 200000) e.minPay = "Enter an amount between RWF 5,000 and RWF 200,000.";
    if (!s.availability.radius) e.radius = "How far are you willing to go?";
  }
  if (id === "verify") {
    if (!s.verify.idFront) e.idFront = "Upload the front of your National ID.";
    if (!s.verify.selfie) e.selfie = "Take a selfie so we can match it to your ID.";
  }
  if (id === "review") {
    if (!s.agreed) e.agreed = "You need to agree to the Community standards to join.";
  }
  return e;
}

/** First step that doesn't pass, or null when everything is ready to submit. */
export function firstInvalidStep(s: OnboardingState): number | null {
  const i = STEPS.findIndex((st) => Object.keys(validateStep(st.id, s)).length > 0);
  return i === -1 ? null : i;
}
