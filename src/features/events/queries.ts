import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import type { Event, EventFilters } from "@/types";
import { eventsApi } from "./api";

export const useEvents = (filters: EventFilters = {}) =>
  useQuery({ queryKey: qk.events.public(filters), queryFn: () => eventsApi.list(filters), placeholderData: (prev) => prev });

export const usePastEvents = (limit?: number) =>
  useQuery({ queryKey: [...qk.events.past, limit] as const, queryFn: () => eventsApi.past(limit) });

/**
 * `initialEvent` is the server's seed answer, and it only paints the first frame. Dating it to
 * the epoch makes it stale on arrival, so the query refetches on mount and the browser store —
 * where an admin's publish, reject or archive actually lands — always gets the last word on
 * whether this event is still public.
 */
export const useEvent = (slug: string | undefined, initialEvent?: Event) =>
  useQuery({
    queryKey: qk.events.detail(slug ?? ""),
    queryFn: () => eventsApi.bySlug(slug!),
    enabled: !!slug,
    initialData: initialEvent,
    initialDataUpdatedAt: 0,
  });

export const useRelatedEvents = (id: string | undefined, limit?: number) =>
  useQuery({ queryKey: [...qk.events.related(id ?? ""), limit] as const, queryFn: () => eventsApi.related(id!, limit), enabled: !!id });

export const useDestinations = () =>
  useQuery({ queryKey: qk.destinations.list(true), queryFn: eventsApi.destinations, staleTime: Infinity });

export const useDestination = (slug: string | undefined) =>
  useQuery({ queryKey: qk.destinations.detail(slug ?? ""), queryFn: () => eventsApi.destination(slug!), enabled: !!slug });

export const useSavedEventIds = (userId: string) =>
  useQuery({ queryKey: qk.events.saved(userId), queryFn: () => eventsApi.savedIds(userId) });

export function useToggleSavedEvent(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => eventsApi.toggleSaved(userId, eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.events.saved(userId) }),
  });
}

export function useAttendEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => eventsApi.attend(eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.events.all }),
  });
}
