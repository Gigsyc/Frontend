import type { EventStatus } from "@/types";

/**
 * How a partner reads each event status. The badge colours stay the admin's (one status,
 * one colour across both workspaces); only the words change — see DESIGN.md, Iteration 4.
 */
export const PARTNER_EVENT_STATUS: Record<EventStatus, string> = {
  draft: "Draft — only you can see this",
  pending_review: "With GigSyc for review",
  published: "Live on GigSyc",
  rejected: "Needs changes",
  cancelled: "Cancelled",
  completed: "Finished",
};

export const partnerEventStatus = (status: EventStatus) => PARTNER_EVENT_STATUS[status];
