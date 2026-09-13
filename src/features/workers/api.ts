import { store } from "@/lib/mock/store";
import type { Worker, WorkerFilters } from "@/types";
export const workersApi = {
  list: (filters: WorkerFilters) => store.listWorkers(filters),
  get: (id: string) => store.getWorker(id),
  update: (id: string, patch: Partial<Worker>) => store.updateWorker(id, patch),
};
