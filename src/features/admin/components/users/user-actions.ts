import type { PlatformUser, PlatformUserStatus } from "@/types";

export type UserAction = "approve" | "suspend" | "reactivate";

export const NEXT_STATUS: Record<UserAction, PlatformUserStatus> = {
  approve: "active",
  suspend: "suspended",
  reactivate: "active",
};

export const ACTION_LABEL: Record<UserAction, string> = {
  approve: "Approve account",
  suspend: "Suspend account",
  reactivate: "Reactivate account",
};

export function actionsFor(status: PlatformUserStatus): UserAction[] {
  if (status === "pending") return ["approve", "suspend"];
  if (status === "suspended") return ["reactivate"];
  return ["suspend"];
}

export function confirmCopy(action: UserAction, user: PlatformUser): { title: string; body: string; confirm: string; toast: string } {
  switch (action) {
    case "approve":
      return {
        title: `Approve ${user.name}?`,
        body: "They can sign in, save events and register straight away. You can suspend the account later if something looks wrong.",
        confirm: "Approve account",
        toast: `${user.name} is approved.`,
      };
    case "suspend":
      return {
        title: `Suspend ${user.name}?`,
        body: "They lose access immediately. Anything they have already registered for stays booked, and you can reactivate the account at any time.",
        confirm: "Suspend account",
        toast: `${user.name} is suspended.`,
      };
    default:
      return {
        title: `Reactivate ${user.name}?`,
        body: "Access comes back immediately, with their saved events and history intact.",
        confirm: "Reactivate account",
        toast: `${user.name} is active again.`,
      };
  }
}
