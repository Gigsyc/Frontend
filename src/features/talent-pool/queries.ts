import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { talentPoolApi } from "./api";

export const useTalentPool = (employerId: string) =>
  useQuery({ queryKey: qk.talentPool.byEmployer(employerId), queryFn: () => talentPoolApi.list(employerId) });

export function useToggleTalentPool(employerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { workerId: string; note?: string }) => talentPoolApi.toggle(employerId, v.workerId, v.note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.talentPool.all });
      qc.invalidateQueries({ queryKey: qk.shifts.all });
    },
  });
}

/** Edit the private note on a pool entry; pass "" to delete it. */
export function useUpdatePoolNote(employerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { workerId: string; note: string }) => talentPoolApi.updateNote(employerId, v.workerId, v.note),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.talentPool.byEmployer(employerId) }),
  });
}
