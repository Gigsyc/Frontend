"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useCustomerSession } from "@/features/session";
import { errorMessage } from "@/lib/utils";
import type { Event } from "@/types";
import { useSavedEventIds, useToggleSavedEvent } from "../queries";

/**
 * The customer's bookmarks, composed from the session and the two saved-event hooks so every
 * surface that shows an `EventCard` saves the same way and toasts the same words.
 *
 * A bookmark takes ~400ms to land, so the same event is only ever in flight once: a second tap
 * before the first settles is the same intent, not a second one, and would otherwise fire a
 * contradictory pair of toasts. `isSavingEvent(event)` lets a card show that it is mid-flight.
 */
export function useSavedEvents() {
  const { userId } = useCustomerSession();
  const savedQuery = useSavedEventIds(userId);
  const toggle = useToggleSavedEvent(userId);

  const savedIds = useMemo(() => new Set(savedQuery.data ?? []), [savedQuery.data]);

  const pending = useRef(new Set<string>());
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(() => new Set());
  const sync = () => setPendingIds(new Set(pending.current));

  const toggleSave = useCallback(
    (event: Event) => {
      if (pending.current.has(event.id)) return;
      pending.current.add(event.id);
      sync();
      toggle.mutate(event.id, {
        onSuccess: ({ saved }) =>
          saved
            ? toast.success("Saved", { description: `${event.title} is in your saved events.` })
            : toast.success("Removed from saved", { description: `${event.title} is no longer saved.` }),
        onError: (error) => toast.error(errorMessage(error, "We couldn't save that event. Try again.")),
        onSettled: () => {
          pending.current.delete(event.id);
          sync();
        },
      });
    },
    [toggle],
  );

  const isSavingEvent = useCallback((event: Event) => pendingIds.has(event.id), [pendingIds]);

  return { savedIds, savedQuery, toggleSave, isSavingEvent, isSaving: pendingIds.size > 0 };
}
