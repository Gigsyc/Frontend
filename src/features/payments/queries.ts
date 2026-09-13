import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { paymentsApi } from "./api";

export const useWorkerPayouts = (workerId: string) =>
  useQuery({ queryKey: qk.payouts.byWorker(workerId), queryFn: () => paymentsApi.payoutsForWorker(workerId) });

export const useEmployerInvoices = (employerId: string) =>
  useQuery({ queryKey: qk.invoices.byEmployer(employerId), queryFn: () => paymentsApi.invoicesForEmployer(employerId) });

export const useInvoice = (id: string | undefined) =>
  useQuery({ queryKey: qk.invoices.detail(id ?? ""), queryFn: () => paymentsApi.invoice(id!), enabled: !!id });

export function usePayInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.payInvoice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.invoices.all }),
  });
}
