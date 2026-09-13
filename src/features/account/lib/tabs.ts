import type { UserRole } from "@/types";

export type AccountTab = "profile" | "interests" | "saved" | "settings";

export const ACCOUNT_TAB_LABEL: Record<AccountTab, string> = {
  profile: "Profile",
  interests: "Interests",
  saved: "Saved",
  settings: "Settings",
};

/**
 * Bookmarks and interests are both customer surfaces — interests only ever feed the rows on
 * /events and the homepage, which no other role is shown — so a worker, partner or admin gets
 * their profile and their account settings, and nothing that writes data nothing reads.
 */
export function accountTabsForRole(role: UserRole): AccountTab[] {
  return role === "customer"
    ? ["profile", "interests", "saved", "settings"]
    : ["profile", "settings"];
}

/** `?tab=` is the source of truth; anything unrecognised falls back to the profile. */
export function parseAccountTab(value: string | null, allowed: AccountTab[]): AccountTab {
  return allowed.find((t) => t === value) ?? "profile";
}
