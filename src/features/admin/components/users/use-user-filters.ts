"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { PlatformRole, PlatformUserStatus } from "@/types";

export type RoleFilter = PlatformRole | "all";
export type StatusFilter = PlatformUserStatus | "all";

export interface UserFilterState {
  query: string;
  role: RoleFilter;
  status: StatusFilter;
}

const ROLES: RoleFilter[] = ["all", "customer", "professional", "organizer", "admin"];
const STATUSES: StatusFilter[] = ["all", "active", "pending", "suspended"];

export const ROLE_OPTIONS: Array<{ value: RoleFilter; label: string }> = [
  { value: "all", label: "All roles" },
  { value: "customer", label: "Customer" },
  { value: "professional", label: "Professional" },
  { value: "organizer", label: "Organizer" },
  { value: "admin", label: "Admin" },
];

export const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
];

export const ROLE_LABEL: Record<PlatformRole, string> = {
  customer: "Customer",
  professional: "Professional",
  organizer: "Organizer",
  admin: "Admin",
};

const pick = <T extends string>(raw: string | null, allowed: T[], fallback: T): T =>
  (allowed as string[]).includes(raw ?? "") ? (raw as T) : fallback;

/** Search and the two selects live in the URL so an operator can paste a filtered view to a colleague. */
export function useUserFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state = useMemo<UserFilterState>(
    () => ({
      query: searchParams.get("q") ?? "",
      role: pick(searchParams.get("role"), ROLES, "all"),
      status: pick(searchParams.get("status"), STATUSES, "all"),
    }),
    [searchParams],
  );

  const update = useCallback(
    (patch: Partial<UserFilterState>) => {
      const next = { ...state, ...patch };
      const qs = new URLSearchParams();
      if (next.query.trim()) qs.set("q", next.query.trim());
      if (next.role !== "all") qs.set("role", next.role);
      if (next.status !== "all") qs.set("status", next.status);
      const search = qs.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [state, router, pathname],
  );

  const clear = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);

  return { state, update, clear };
}

export const hasUserFilters = (s: UserFilterState) => !!s.query.trim() || s.role !== "all" || s.status !== "all";
