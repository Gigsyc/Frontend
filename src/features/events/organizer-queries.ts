import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import type { Event } from "@/types";
import { organizerEventsApi, type OrganizerEventInput } from "./organizer-api";

/**
 * A partner's write touches their own list, the admin queue, the public site and the
 * admin's notifications — one event model, so everything downstream is invalidated.
 */
function invalidateEventGraph(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: qk.events.all });
  qc.invalidateQueries({ queryKey: qk.admin.all });
  qc.invalidateQueries({ queryKey: qk.notifications.all });
}

export const useOrganizerEvents = (employerId: string) =>
  useQuery({ queryKey: qk.events.byOrganizer(employerId), queryFn: () => organizerEventsApi.list(employerId) });

export const useOrganizerEvent = (employerId: string, id: string | undefined) =>
  useQuery({
    queryKey: [...qk.events.byOrganizer(employerId), id ?? ""] as const,
    queryFn: () => organizerEventsApi.get(employerId, id!),
    enabled: !!id,
  });

export function useCreateOrganizerEvent(employerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OrganizerEventInput) => organizerEventsApi.create(employerId, input),
    onSuccess: () => invalidateEventGraph(qc),
  });
}

export function useUpdateOrganizerEvent(employerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; patch: Partial<Event> }) => organizerEventsApi.update(employerId, v.id, v.patch),
    onSuccess: () => invalidateEventGraph(qc),
  });
}

export function useSubmitOrganizerEvent(employerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizerEventsApi.submit(employerId, id),
    onSuccess: () => invalidateEventGraph(qc),
  });
}

export function useCancelOrganizerEvent(employerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; reason?: string }) => organizerEventsApi.cancel(employerId, v.id, v.reason),
    onSuccess: () => invalidateEventGraph(qc),
  });
}

export function useDeleteOrganizerDraft(employerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizerEventsApi.deleteDraft(employerId, id),
    onSuccess: () => invalidateEventGraph(qc),
  });
}
