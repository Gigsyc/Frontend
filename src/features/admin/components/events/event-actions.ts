import { Archive, CalendarX, CheckCheck, EyeOff, Send, Undo2, XCircle, type LucideIcon } from "lucide-react";
import type { EventStatus } from "@/types";

export interface EventActionDef {
  id: string;
  label: string;
  /** The status the event ends up in. */
  status: EventStatus;
  icon: LucideIcon;
  destructive?: boolean;
  /** Requires a written reason, stored as the review note. */
  needsReason?: boolean;
  /** Present when the change needs confirming first. */
  confirm?: { title: string; body: string; cta: string };
  /** Promoted to a button on the record screen instead of living in the ⋯ menu. */
  primary?: boolean;
}

const APPROVE: EventActionDef = { id: "approve", label: "Approve & publish", status: "published", icon: CheckCheck, primary: true };

const PUBLISH: EventActionDef = { id: "publish", label: "Publish", status: "published", icon: Send, primary: true };

const REJECT: EventActionDef = {
  id: "reject", label: "Reject…", status: "rejected", icon: XCircle, destructive: true, needsReason: true, primary: true,
};

const UNPUBLISH: EventActionDef = {
  id: "unpublish", label: "Unpublish", status: "draft", icon: EyeOff, primary: true,
  confirm: {
    title: "Unpublish this event?",
    body: "It disappears from /events and its public page right away. The listing stays here as a draft, so you can publish it again once the organiser sorts things out.",
    cta: "Unpublish",
  },
};

const ARCHIVE: EventActionDef = { id: "archive", label: "Archive", status: "completed", icon: Archive, primary: true };

const CANCEL: EventActionDef = {
  id: "cancel", label: "Cancel event", status: "cancelled", icon: CalendarX, destructive: true,
  confirm: {
    title: "Cancel this event?",
    body: "Anyone holding the link will see it marked cancelled rather than a missing page. Ticket holders still need to be told directly.",
    cta: "Cancel event",
  },
};

const REOPEN: EventActionDef = { id: "reopen", label: "Move back to review", status: "pending_review", icon: Undo2, primary: true };

/** What an operations person can do to an event, given where it is now. */
export function actionsFor(status: EventStatus): EventActionDef[] {
  switch (status) {
    case "pending_review": return [APPROVE, REJECT];
    case "published": return [UNPUBLISH, ARCHIVE, CANCEL];
    case "draft": return [PUBLISH];
    case "rejected": return [REOPEN];
    default: return [];
  }
}

export const BULK_APPROVE = APPROVE;
export const BULK_REJECT = REJECT;
