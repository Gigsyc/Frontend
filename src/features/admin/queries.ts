import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import type { AdminEventFilters, Destination, EventStatus, PlatformUser } from "@/types";
import { adminApi } from "./api";

/** Admin writes change what the public site shows, so both trees are invalidated. */
function invalidateEventGraph(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: qk.admin.all });
  qc.invalidateQueries({ queryKey: qk.events.all });
}

export const useAdminEvents = (filters: AdminEventFilters = {}) =>
  useQuery({ queryKey: qk.admin.events(filters), queryFn: () => adminApi.events(filters), placeholderData: (prev) => prev });

export const useAdminEvent = (id: string | undefined) =>
  useQuery({ queryKey: qk.admin.event(id ?? ""), queryFn: () => adminApi.event(id!), enabled: !!id });

export function useSetEventStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; status: EventStatus; note?: string }) => adminApi.setEventStatus(v.id, v.status, v.note),
    onSuccess: () => invalidateEventGraph(qc),
  });
}

export function useSetEventFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; featured: boolean }) => adminApi.setEventFeatured(v.id, v.featured),
    onSuccess: () => invalidateEventGraph(qc),
  });
}

export const useAdminDestinations = () =>
  useQuery({ queryKey: qk.destinations.list(false), queryFn: adminApi.destinations });

export function useUpdateDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; patch: Partial<Destination> }) => adminApi.updateDestination(v.id, v.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.destinations.all }),
  });
}

export const useAdminUsers = () => useQuery({ queryKey: qk.admin.users, queryFn: adminApi.users });

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; status: PlatformUser["status"] }) => adminApi.setUserStatus(v.id, v.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.admin.users }),
  });
}

export function useSetPartnerVerified() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { employerId: string; verified: boolean }) => adminApi.setPartnerVerified(v.employerId, v.verified),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.employers.all });
      qc.invalidateQueries({ queryKey: qk.admin.all });
    },
  });
}

export const useReports = () => useQuery({ queryKey: qk.admin.reports, queryFn: adminApi.reports });

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; outcome: "resolved" | "dismissed"; resolution: string }) =>
      adminApi.resolveReport(v.id, v.outcome, v.resolution),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.admin.reports }),
  });
}

export const useSystemServices = () =>
  useQuery({ queryKey: qk.admin.system, queryFn: adminApi.system, refetchInterval: 60_000 });
