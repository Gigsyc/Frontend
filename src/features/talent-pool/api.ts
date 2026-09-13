import { store } from "@/lib/mock/store";
export const talentPoolApi = {
  list: (employerId: string) => store.listTalentPool(employerId),
  toggle: (employerId: string, workerId: string, note?: string) => store.toggleTalentPool(employerId, workerId, note),
  updateNote: (employerId: string, workerId: string, note: string) => store.updateTalentPoolNote(employerId, workerId, note),
};
