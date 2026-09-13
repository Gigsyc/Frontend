import { ROLES } from "@/data/roles";
import type { RoleCategory } from "@/types";

/** "Good morning, Aline" — the header greeting. Falls back to the greeting alone while the profile loads. */
export function greeting(firstName?: string, now = new Date()) {
  const h = now.getHours();
  const word = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return firstName ? `${word}, ${firstName}` : word;
}

/** "servers, registration and hosts" — for the empty state nudge. */
export function skillsSentence(skills: RoleCategory[]) {
  const words = skills.map((s) => ROLES[s].short.toLowerCase());
  if (words.length === 0) return "your skills";
  if (words.length === 1) return words[0];
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}
