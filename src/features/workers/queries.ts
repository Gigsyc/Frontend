import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import type { Worker, WorkerFilters } from "@/types";
import { workersApi } from "./api";

export const useWorkers = (filters: WorkerFilters = {}) =>
  useQuery({ queryKey: qk.workers.list(filters), queryFn: () => workersApi.list(filters), placeholderData: (prev) => prev });

export const useWorker = (id: string | undefined) =>
  useQuery({ queryKey: qk.workers.detail(id ?? ""), queryFn: () => workersApi.get(id!), enabled: !!id });

export function useUpdateWorker(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Worker>) => workersApi.update(id, patch),
    onSuccess: (w) => {
      qc.setQueryData(qk.workers.detail(id), w);
      qc.invalidateQueries({ queryKey: qk.workers.all });
    },
  });
}
