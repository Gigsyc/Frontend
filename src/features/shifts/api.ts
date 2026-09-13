import { store } from "@/lib/mock/store";
import type { Shift, ShiftFilters } from "@/types";

export type CreateShiftInput = Omit<Shift, "id" | "createdAt" | "status"> & { status?: Shift["status"] };

export const shiftsApi = {
  listOpen: (filters: ShiftFilters) => store.listOpenShifts(filters),
  /** Every non-draft shift across employers — join target for bookings/payouts on the worker side. */
  listAll: () => store.listShifts({}, { includeDrafts: false }),
  listForEmployer: (employerId: string, filters?: ShiftFilters) => store.listShifts(filters, { employerId, includeDrafts: true }),
  get: (id: string) => store.getShift(id),
  create: (input: CreateShiftInput) => store.createShift(input),
  update: (id: string, patch: Partial<Shift>) => store.updateShift(id, patch),
  cancel: (id: string) => store.cancelShift(id),
  /** Hard delete. Only ever used on drafts — posted shifts are cancelled so workers keep the record. */
  remove: (id: string) => store.deleteShift(id),
  candidates: (id: string) => store.rankWorkersForShift(id),
};
