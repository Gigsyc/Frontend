import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { employersApi } from "./api";

export const useEmployers = () => useQuery({ queryKey: qk.employers.all, queryFn: employersApi.list, staleTime: Infinity });
export const useEmployer = (id: string | undefined) =>
  useQuery({ queryKey: qk.employers.detail(id ?? ""), queryFn: () => employersApi.get(id!), enabled: !!id, staleTime: Infinity });
