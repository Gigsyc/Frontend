import { format } from "date-fns";
import { shiftHours } from "@/lib/utils";
import type { WizardState } from "./state";

export type StepErrors = Partial<Record<keyof WizardState, string>>;

export const todayIso = () => format(new Date(), "yyyy-MM-dd");

export function validateStep(step: number, s: WizardState): StepErrors {
  const e: StepErrors = {};
  if (step === 0) {
    if (!s.role) e.role = "Pick the role you're hiring for.";
    const stripped = s.title.replace(/·\s*$/, "").trim();
    if (!s.title.trim()) e.title = "Give the shift a title workers will recognise.";
    else if (/·\s*$/.test(s.title.trim())) e.title = "Add what the shift is for after the “·”, e.g. the event or venue.";
    else if (stripped.length < 4) e.title = "That title is too short to be useful.";
    if (!Number.isInteger(s.workersNeeded) || s.workersNeeded < 1) e.workersNeeded = "You need at least one worker.";
    else if (s.workersNeeded > 200) e.workersNeeded = "For more than 200 workers, talk to us and we'll set it up.";
  }
  if (step === 1) {
    if (!s.date) e.date = "Choose the shift date.";
    else if (s.date < todayIso()) e.date = "The date has already passed.";
    if (!s.startTime) e.startTime = "Set a start time.";
    if (!s.endTime) e.endTime = "Set an end time.";
    if (s.startTime && s.endTime) {
      const hours = shiftHours(s.startTime, s.endTime, s.breakMinutes);
      if (s.startTime === s.endTime) e.endTime = "Start and end can't be the same time.";
      else if (hours <= 0) e.breakMinutes = "The break is longer than the shift.";
      else if (hours > 16) e.endTime = "Shifts over 16 hours need to be split in two.";
    }
    if (!s.venue.trim()) e.venue = "Where is the shift? Workers see this on the card.";
    if (!s.district) e.district = "Pick the district.";
    if (!s.address.trim()) e.address = "Add a street or landmark so workers can find it.";
    if (!s.supervisorName.trim()) e.supervisorName = "Who should workers report to on the day?";
    if (!s.supervisorPhone.trim()) e.supervisorPhone = "Add a phone number for the day.";
    else if (s.supervisorPhone.replace(/\D/g, "").length < 9) e.supervisorPhone = "That doesn't look like a full phone number.";
  }
  if (step === 2) {
    const pay = Number(s.pay);
    if (!s.pay.trim()) e.pay = "Set the pay per shift.";
    else if (!Number.isFinite(pay) || pay <= 0) e.pay = "Pay must be a whole number of francs.";
    else if (pay < 5000) e.pay = "Shifts under RWF 5,000 can't be posted.";
    if (s.transport.trim()) {
      const t = Number(s.transport);
      if (!Number.isFinite(t) || t < 0) e.transport = "Transport allowance must be a number.";
    }
    if (s.description.trim().length < 20) e.description = "Describe the work in a sentence or two — at least 20 characters.";
    if (!s.responsibilities.some((r) => r.trim())) e.responsibilities = "List at least one responsibility.";
  }
  return e;
}

/**
 * Posting needs every step to pass. A draft only needs step 0 — the role and a title to recognise
 * it by — because a draft exists precisely for a shift that isn't worked out yet.
 */
export function firstInvalidStep(s: WizardState, status: "open" | "draft" = "open"): number | null {
  const last = status === "draft" ? 1 : 3;
  for (let i = 0; i < last; i++) if (Object.keys(validateStep(i, s)).length) return i;
  return null;
}
