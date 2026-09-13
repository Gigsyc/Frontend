import { store } from "@/lib/mock/store";
import type { EventFilters } from "@/types";

/** Customer-facing reads. Only published events ever come back — see MockStore.listPublicEvents. */
export const eventsApi = {
  list: (filters: EventFilters) => store.listPublicEvents(filters),
  past: (limit?: number) => store.listPastEvents(limit),
  bySlug: (slug: string) => store.getPublicEventBySlug(slug),
  related: (id: string, limit?: number) => store.listRelatedEvents(id, limit),
  destinations: () => store.listDestinations({ publishedOnly: true }),
  destination: (slug: string) => store.getDestination(slug),
  savedIds: (userId: string) => store.listSavedEventIds(userId),
  toggleSaved: (userId: string, eventId: string) => store.toggleSavedEvent(userId, eventId),
  attend: (eventId: string) => store.attendEvent(eventId),
};
