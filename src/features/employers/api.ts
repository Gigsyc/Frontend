import { store } from "@/lib/mock/store";
export const employersApi = {
  list: () => store.listEmployers(),
  get: (id: string) => store.getEmployer(id),
};
