"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { DISTRICTS, ROLES } from "@/data/roles";
import type { KigaliDistrict, RoleCategory, WorkerFilters } from "@/types";

export type WorkerSort = NonNullable<WorkerFilters["sort"]>;

export const WORKER_SORTS: Array<{ value: WorkerSort; label: string }> = [
  { value: "best_match", label: "Best match" },
  { value: "rating", label: "Highest rated" },
  { value: "reliability", label: "Most reliable" },
  { value: "experience", label: "Most experienced" },
];

export const MIN_RATINGS: Array<{ value: number; label: string }> = [
  { value: 0, label: "Any rating" },
  { value: 4, label: "4.0 and up" },
  { value: 4.5, label: "4.5 and up" },
  { value: 4.8, label: "4.8 and up" },
];

export interface WorkerFilterState {
  q: string;
  roles: RoleCategory[];
  district: KigaliDistrict | "";
  /** 0 = any */
  minRating: number;
  verifiedOnly: boolean;
  sort: WorkerSort;
}

export const isRole = (v: string): v is RoleCategory => v in ROLES;
export const isDistrict = (v: string): v is KigaliDistrict => (DISTRICTS as string[]).includes(v);
export const isSort = (v: string): v is WorkerSort => WORKER_SORTS.some((s) => s.value === v);

type ParamReader = { get(name: string): string | null };

/** URL → filter state. Unknown values fall back to defaults so a mangled link still works. */
export function parseWorkerFilters(sp: ParamReader): WorkerFilterState {
  const rating = Number(sp.get("rating"));
  const district = sp.get("district") ?? "";
  const sort = sp.get("sort") ?? "";
  return {
    q: sp.get("q") ?? "",
    roles: (sp.get("roles") ?? "").split(",").filter(isRole),
    district: isDistrict(district) ? district : "",
    minRating: MIN_RATINGS.some((r) => r.value === rating && rating > 0) ? rating : 0,
    verifiedOnly: sp.get("verified") === "1",
    sort: isSort(sort) ? sort : "best_match",
  };
}

/** Filter state → the shape the workers API expects. Undefined keys are omitted. */
export function toWorkerFilters(s: WorkerFilterState): WorkerFilters {
  const f: WorkerFilters = { sort: s.sort };
  const q = s.q.trim();
  if (q) f.query = q;
  if (s.roles.length) f.roles = s.roles;
  if (s.district) f.districts = [s.district];
  if (s.minRating) f.minRating = s.minRating;
  if (s.verifiedOnly) f.verifiedOnly = true;
  return f;
}

export function countActiveFilters(s: WorkerFilterState) {
  return [s.q.trim() !== "", s.roles.length > 0, s.district !== "", s.minRating > 0, s.verifiedOnly].filter(Boolean).length;
}

/**
 * Filters live in the URL (?q=&roles=&district=&rating=&verified=&sort=) so a search is shareable
 * and survives a refresh. Other params (e.g. ?tab=) are preserved.
 */
export function useWorkerFilterParams() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state = useMemo(() => parseWorkerFilters(sp), [sp]);
  const filters = useMemo(() => toWorkerFilters(state), [state]);

  const update = useCallback(
    (patch: Partial<WorkerFilterState>) => {
      const next = { ...state, ...patch };
      const params = new URLSearchParams(sp.toString());
      const put = (key: string, value: string | undefined) => (value ? params.set(key, value) : params.delete(key));
      put("q", next.q.trim() || undefined);
      put("roles", next.roles.join(",") || undefined);
      put("district", next.district || undefined);
      put("rating", next.minRating ? String(next.minRating) : undefined);
      put("verified", next.verifiedOnly ? "1" : undefined);
      put("sort", next.sort !== "best_match" ? next.sort : undefined);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [state, sp, router, pathname],
  );

  const clear = useCallback(() => update({ q: "", roles: [], district: "", minRating: 0, verifiedOnly: false }), [update]);

  return { state, filters, update, clear, activeCount: countActiveFilters(state) };
}
