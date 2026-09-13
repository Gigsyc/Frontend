"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useCustomerSession } from "@/features/session";
import { errorMessage } from "@/lib/utils";
import type { Event } from "@/types";
import { useSavedEventIds, useToggleSavedEvent } from "../queries";

/**
 * The customer's bookmarks, composed from the session and the two saved-event hooks so every
 * surface that shows an `EventCard` saves the same way and toasts the same words.
 */
export function useSavedEvents() {
  const { userId } = useCustomerSession();
  const savedQuery = useSavedEventIds(userId);
  const toggle = useToggleSavedEvent(userId);

  const savedIds = useMemo(() => new Set(savedQuery.data ?? []), [savedQuery.data]);

  const toggleSave = useCallback(
    (event: Event) => {
      toggle.mutate(event.id, {
        onSuccess: ({ saved }) =>
          saved
            ? toast.success("Saved", { description: `${event.title} is in your saved events.` })
            : toast.success("Removed from saved", { description: `${event.title} is no longer saved.` }),
        onError: (error) => toast.error(errorMessage(error, "We couldn't save that event. Try again.")),
      });
    },
    [toggle],
  );

  return { savedIds, savedQuery, toggleSave, isSaving: toggle.isPending };
}
