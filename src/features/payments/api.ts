import { store } from "@/lib/mock/store";
export const paymentsApi = {
  payoutsForWorker: (workerId: string) => store.listPayoutsForWorker(workerId),
  invoicesForEmployer: (employerId: string) => store.listInvoicesForEmployer(employerId),
  invoice: (id: string) => store.getInvoice(id),
  payInvoice: (id: string) => store.payInvoice(id),
};
