"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useSetEventFeatured, useSetEventStatus } from "@/features/admin/queries";
import { errorMessage, pluralize } from "@/lib/utils";
import type { Event, EventStatus } from "@/types";

type EventRef = Pick<Event, "id" | "title">;

/**
 * Every state change is announced in the words an operations person would use with a
 * colleague — what happened, and what the public site does about it.
 */
const CONSEQUENCE: Record<EventStatus, { title: string; describe: (title: string) => string }> = {
  published: { title: "Published", describe: (t) => `${t} is now live on the public site.` },
  draft: { title: "Unpublished", describe: (t) => `${t} is back to draft. It no longer appears on /events.` },
  completed: { title: "Archived", describe: (t) => `${t} is marked completed and has left the public listings.` },
  cancelled: { title: "Event cancelled", describe: (t) => `${t} now shows as cancelled to anyone holding the link.` },
  rejected: { title: "Rejected", describe: (t) => `The organiser of ${t} was notified with your reason.` },
  pending_review: { title: "Back in the review queue", describe: (t) => `${t} is waiting for a decision again.` },
};

const BULK_DONE: Partial<Record<EventStatus, (n: number) => string>> = {
  published: (n) => `${pluralize(n, "event")} now live on the public site.`,
  rejected: (n) => `${pluralize(n, "organiser")} notified with your reason.`,
};

/** Wraps the admin event mutations so every caller toasts the same consequence. */
export function useEventStatusActions() {
  const status = useSetEventStatus();
  const featured = useSetEventFeatured();

  const setStatus = useCallback(
    async (event: EventRef, next: EventStatus, note?: string) => {
      try {
        await status.mutateAsync({ id: event.id, status: next, note });
        const c = CONSEQUENCE[next];
        toast.success(c.title, { description: c.describe(event.title) });
        return true;
      } catch (err) {
        toast.error(errorMessage(err));
        return false;
      }
    },
    [status],
  );

  const setStatusMany = useCallback(
    async (events: EventRef[], next: EventStatus, note?: string) => {
      let done = 0;
      let failure: unknown;
      for (const e of events) {
        try {
          await status.mutateAsync({ id: e.id, status: next, note });
          done += 1;
        } catch (err) {
          failure = err;
        }
      }
      if (done > 0) {
        const describe = BULK_DONE[next] ?? ((n: number) => `${pluralize(n, "event")} updated.`);
        toast.success(CONSEQUENCE[next].title, { description: describe(done) });
      }
      if (failure) toast.error(errorMessage(failure));
      return done;
    },
    [status],
  );

  const setFeatured = useCallback(
    async (event: EventRef, next: boolean) => {
      try {
        await featured.mutateAsync({ id: event.id, featured: next });
        toast.success(next ? "Featured" : "No longer featured", {
          description: next ? `${event.title} is pinned to the top of /events.` : `${event.title} sits with everything else on /events.`,
        });
      } catch (err) {
        toast.error(errorMessage(err));
      }
    },
    [featured],
  );

  return {
    setStatus,
    setStatusMany,
    setFeatured,
    isPending: status.isPending,
    /** Row currently mid-change, so the table can dim exactly one row. */
    pendingId: status.isPending ? status.variables?.id : undefined,
    featuredPendingId: featured.isPending ? featured.variables?.id : undefined,
  };
}
