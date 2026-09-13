import { ROLES } from "@/data/roles";
import type { CreateShiftInput } from "@/features/shifts";
import type { RoleCategory, Shift } from "@/types";
import { COVER_BY_ROLE } from "./covers";
import type { WizardState } from "./state";
import { todayIso } from "./validation";

/**
 * Turn wizard state into the input the store expects.
 * Posting only happens once every step validates. Drafts can be saved from step 0, so the fields
 * the employer hasn't reached yet fall back to values the rest of the app can render.
 */
export function buildShiftInput(s: WizardState, employerId: string, status: "draft" | "open"): CreateShiftInput {
  const role: RoleCategory = s.role ?? "waiter";
  const transport = Number(s.transport);
  const pay = Math.round(Number(s.pay));
  return {
    employerId,
    title: s.title.trim(),
    role,
    sector: ROLES[role].sector,
    description: s.description.trim(),
    responsibilities: s.responsibilities.map((r) => r.trim()).filter(Boolean),
    requirements: s.requirements.map((r) => r.trim()).filter(Boolean),
    dressCode: s.dressCode.trim() || undefined,
    venue: s.venue.trim(),
    district: s.district || "Kimihurura",
    address: s.address.trim(),
    date: s.date || todayIso(),
    startTime: s.startTime,
    endTime: s.endTime,
    breakMinutes: s.breakMinutes,
    workersNeeded: s.workersNeeded,
    payPerShift: Number.isFinite(pay) && pay > 0 ? pay : 0,
    mealProvided: s.mealProvided,
    transportAllowance: s.transport.trim() && transport > 0 ? Math.round(transport) : undefined,
    status,
    urgent: s.urgent,
    coverImage: COVER_BY_ROLE[role],
    supervisor: { name: s.supervisorName.trim(), phone: s.supervisorPhone.trim() },
    checkInMethod: s.checkInMethod,
  };
}

/** A preview Shift for the review step's card. */
export function previewShift(s: WizardState, employerId: string): Shift {
  return {
    ...buildShiftInput(s, employerId, "open"),
    id: "preview",
    status: "open",
    createdAt: new Date().toISOString(),
    date: s.date || new Date().toISOString().slice(0, 10),
  };
}
