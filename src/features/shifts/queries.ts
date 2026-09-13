import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import type { Shift, ShiftFilters } from "@/types";
import { shiftsApi, type CreateShiftInput } from "./api";

export const useOpenShifts = (filters: ShiftFilters = {}) =>
  useQuery({ queryKey: qk.shifts.open(filters), queryFn: () => shiftsApi.listOpen(filters), placeholderData: (prev) => prev });

export const useAllShifts = () =>
  useQuery({ queryKey: [...qk.shifts.all, "all"] as const, queryFn: () => shiftsApi.listAll() });

export const useEmployerShifts = (employerId: string, filters?: ShiftFilters) =>
  useQuery({ queryKey: qk.shifts.byEmployer(employerId, filters), queryFn: () => shiftsApi.listForEmployer(employerId, filters) });

export const useShift = (id: string | undefined) =>
  useQuery({ queryKey: qk.shifts.detail(id ?? ""), queryFn: () => shiftsApi.get(id!), enabled: !!id });

export const useShiftCandidates = (id: string | undefined) =>
  useQuery({ queryKey: qk.shifts.candidates(id ?? ""), queryFn: () => shiftsApi.candidates(id!), enabled: !!id });

export function useCreateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateShiftInput) => shiftsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.shifts.all });
      qc.invalidateQueries({ queryKey: qk.notifications.all });
    },
  });
}

export function useUpdateShift(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Shift>) => shiftsApi.update(id, patch),
    onSuccess: (shift) => {
      qc.setQueryData(qk.shifts.detail(id), shift);
      qc.invalidateQueries({ queryKey: qk.shifts.all });
    },
  });
}

/** Deletes a draft outright, so it stops showing in the Jobs list. */
export function useDeleteShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.shifts.all });
      qc.invalidateQueries({ queryKey: qk.bookings.all });
    },
  });
}

export function useCancelShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.shifts.all });
      qc.invalidateQueries({ queryKey: qk.bookings.all });
    },
  });
}
