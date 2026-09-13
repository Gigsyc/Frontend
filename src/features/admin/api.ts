import { store } from "@/lib/mock/store";
import type { AdminEventFilters, Destination, EventStatus, PlatformUser } from "@/types";

export const adminApi = {
  events: (filters: AdminEventFilters) => store.listAdminEvents(filters),
  event: (id: string) => store.getAdminEvent(id),
  setEventStatus: (id: string, status: EventStatus, note?: string) => store.setEventStatus(id, status, note),
  setEventFeatured: (id: string, featured: boolean) => store.setEventFeatured(id, featured),
  destinations: () => store.listDestinations(),
  updateDestination: (id: string, patch: Partial<Destination>) => store.updateDestination(id, patch),
  users: () => store.listPlatformUsers(),
  user: (id: string) => store.getPlatformUser(id),
  setUserStatus: (id: string, status: PlatformUser["status"]) => store.setPlatformUserStatus(id, status),
  partners: () => store.listEmployers(),
  setPartnerVerified: (employerId: string, verified: boolean) => store.setPartnerVerified(employerId, verified),
  reports: () => store.listReports(),
  resolveReport: (id: string, outcome: "resolved" | "dismissed", resolution: string) => store.resolveReport(id, outcome, resolution),
  system: () => store.listSystemServices(),
};
