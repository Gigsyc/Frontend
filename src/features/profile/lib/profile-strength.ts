import type { Worker } from "@/types";

/** Where the "next best action" should send the worker. */
export type StrengthActionKind = "edit" | "skills" | "certification" | "availability" | "verify";

export interface StrengthItem {
  id: string;
  label: string;
  weight: number;
  done: boolean;
  action: { label: string; kind: StrengthActionKind };
}

export interface ProfileStrength {
  percent: number;
  items: StrengthItem[];
  /** Heaviest missing item, or null when the profile is complete. */
  next: StrengthItem | null;
}

/**
 * Profile strength is weighted towards what employers actually rank on: verifications and skills first,
 * then the fields that make a profile readable. Weights sum to 100.
 */
export function computeProfileStrength(w: Worker): ProfileStrength {
  const items: StrengthItem[] = [
    { id: "identity", label: "National ID verified", weight: 12, done: w.verifications.identity, action: { label: "Verify your ID", kind: "verify" } },
    { id: "phone", label: "Phone confirmed", weight: 6, done: w.verifications.phone, action: { label: "Confirm your phone", kind: "verify" } },
    { id: "photo", label: "Photo matched to ID", weight: 6, done: w.verifications.photo, action: { label: "Add a profile photo", kind: "verify" } },
    { id: "headline", label: "Headline", weight: 8, done: w.headline.trim().length >= 10, action: { label: "Write a headline", kind: "edit" } },
    { id: "bio", label: "Bio of 60+ characters", weight: 10, done: w.bio.trim().length >= 60, action: { label: "Tell employers about yourself", kind: "edit" } },
    { id: "skills", label: "Two or more skills", weight: 10, done: w.skills.length >= 2, action: { label: "Add a second skill", kind: "skills" } },
    { id: "languages", label: "Languages", weight: 4, done: w.languages.length >= 1, action: { label: "Add your languages", kind: "edit" } },
    { id: "availability", label: "Availability set", weight: 6, done: Object.values(w.availability).some(Boolean), action: { label: "Set when you can work", kind: "availability" } },
    { id: "minPay", label: "Minimum pay", weight: 4, done: typeof w.minShiftPay === "number" && w.minShiftPay > 0, action: { label: "Set your minimum pay", kind: "edit" } },
    { id: "education", label: "Education", weight: 8, done: Boolean(w.education?.trim()), action: { label: "Add your education", kind: "edit" } },
    { id: "certifications", label: "A certification", weight: 10, done: w.certifications.length >= 1, action: { label: "Add a certification", kind: "certification" } },
    { id: "references", label: "References checked", weight: 8, done: w.verifications.references, action: { label: "Add a referee", kind: "verify" } },
    { id: "skillsCheck", label: "Skills assessment", weight: 8, done: w.verifications.skills, action: { label: "Take the skills assessment", kind: "verify" } },
  ];
  const total = items.reduce((a, i) => a + i.weight, 0);
  const earned = items.filter((i) => i.done).reduce((a, i) => a + i.weight, 0);
  const missing = items.filter((i) => !i.done).sort((a, b) => b.weight - a.weight);
  return { percent: Math.round((earned / total) * 100), items, next: missing[0] ?? null };
}
