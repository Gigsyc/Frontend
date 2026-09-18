import { store } from "@/lib/mock/store";
import type { Event } from "@/types";

/** What a partner fills in to list an event. Everything the store derives is omitted. */
export type OrganizerEventInput = Omit<
  Event,
  "id" | "organizerId" | "status" | "featured" | "attending" | "createdAt" | "submittedAt" | "reviewedAt" | "reviewNote" | "staffedShiftIds"
> & { asDraft?: boolean };

/** Partner-side reads and writes. Every call is scoped to the caller's organisation. */
export const organizerEventsApi = {
  list: (employerId: string) => store.listEventsForOrganizer(employerId),
  get: (employerId: string, id: string) => store.getOrganizerEvent(employerId, id),
  create: (employerId: string, input: OrganizerEventInput) => store.createOrganizerEvent(employerId, input),
  update: (employerId: string, id: string, patch: Partial<Event>) => store.updateOrganizerEvent(employerId, id, patch),
  submit: (employerId: string, id: string) => store.submitOrganizerEvent(employerId, id),
  cancel: (employerId: string, id: string, reason?: string) => store.cancelOrganizerEvent(employerId, id, reason),
  deleteDraft: (employerId: string, id: string) => store.deleteOrganizerDraft(employerId, id),
};
