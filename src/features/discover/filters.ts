import { DISTRICTS, ROLES } from "@/data/roles";
import type { KigaliDistrict, RoleCategory, ShiftFilters } from "@/types";

export type DateRange = NonNullable<ShiftFilters["dateRange"]>;
export type SortKey = NonNullable<ShiftFilters["sort"]>;

/** Everything the Discover feed can filter on. Lives in the URL so a filtered feed can be shared or reloaded. */
export interface DiscoverState {
  query: string;
  dateRange: DateRange;
  roles: RoleCategory[];
  districts: KigaliDistrict[];
  minPay: number | undefined;
  urgentOnly: boolean;
  sort: SortKey;
  /** Narrow roles to the worker's own skills. Mutually exclusive with an explicit `roles` list. */
  forYou: boolean;
}

export const DEFAULT_STATE: DiscoverState = {
  query: "",
  dateRange: "all",
  roles: [],
  districts: [],
  minPay: undefined,
  urgentOnly: false,
  sort: "soonest",
  forYou: false,
};

export const DATE_OPTIONS: Array<{ value: DateRange; label: string }> = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This week" },
  { value: "weekend", label: "Weekend" },
];

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "soonest", label: "Soonest first" },
  { value: "pay_desc", label: "Highest pay" },
  { value: "newest", label: "Newest" },
];

export const MIN_PAY_OPTIONS = [15000, 20000, 25000, 30000];

interface ParamsLike {
  get(name: string): string | null;
}

const isRole = (v: string): v is RoleCategory => v in ROLES;
const isDistrict = (v: string): v is KigaliDistrict => (DISTRICTS as string[]).includes(v);
const isDateRange = (v: string | null): v is DateRange => DATE_OPTIONS.some((o) => o.value === v);
const isSort = (v: string | null): v is SortKey => SORT_OPTIONS.some((o) => o.value === v);
const list = (raw: string | null) => (raw ? raw.split(",").filter(Boolean) : []);

export function parseDiscoverParams(sp: ParamsLike): DiscoverState {
  const date = sp.get("date");
  const sort = sp.get("sort");
  const minPay = Number(sp.get("minPay"));
  return {
    query: sp.get("q") ?? "",
    dateRange: isDateRange(date) ? date : "all",
    roles: list(sp.get("roles")).filter(isRole),
    districts: list(sp.get("districts")).filter(isDistrict),
    minPay: Number.isFinite(minPay) && minPay > 0 ? minPay : undefined,
    urgentOnly: sp.get("urgent") === "1",
    sort: isSort(sort) ? sort : "soonest",
    forYou: sp.get("forYou") === "1",
  };
}

export function serializeDiscoverParams(s: DiscoverState): URLSearchParams {
  const p = new URLSearchParams();
  if (s.query.trim()) p.set("q", s.query.trim());
  if (s.dateRange !== "all") p.set("date", s.dateRange);
  if (s.forYou) p.set("forYou", "1");
  if (s.roles.length) p.set("roles", s.roles.join(","));
  if (s.districts.length) p.set("districts", s.districts.join(","));
  if (s.minPay) p.set("minPay", String(s.minPay));
  if (s.urgentOnly) p.set("urgent", "1");
  if (s.sort !== "soonest") p.set("sort", s.sort);
  return p;
}

/** Roles actually applied to the query: the worker's skills when "For you" is on, otherwise the explicit picks. */
export function effectiveRoles(s: DiscoverState, skills: RoleCategory[]): RoleCategory[] {
  return s.forYou ? skills : s.roles;
}

export function toShiftFilters(s: DiscoverState, skills: RoleCategory[]): ShiftFilters {
  const roles = effectiveRoles(s, skills);
  const f: ShiftFilters = { sort: s.sort };
  if (s.query.trim()) f.query = s.query.trim();
  if (roles.length) f.roles = roles;
  if (s.districts.length) f.districts = s.districts;
  if (s.dateRange !== "all") f.dateRange = s.dateRange;
  if (s.minPay) f.minPay = s.minPay;
  if (s.urgentOnly) f.urgentOnly = true;
  return f;
}

/** Tapping a role chip always leaves "For you" and continues from whatever was effectively selected. */
export function toggleRole(s: DiscoverState, role: RoleCategory, skills: RoleCategory[]): Partial<DiscoverState> {
  const base = effectiveRoles(s, skills);
  const roles = base.includes(role) ? base.filter((r) => r !== role) : [...base, role];
  return { forYou: false, roles };
}

export function toggleForYou(s: DiscoverState): Partial<DiscoverState> {
  return { forYou: !s.forYou, roles: [] };
}

/** Number of filter groups set inside the Filters sheet — drives the count badge on the button. */
export function countSheetFilters(s: DiscoverState) {
  return (s.districts.length ? 1 : 0) + (s.minPay ? 1 : 0) + (s.urgentOnly ? 1 : 0) + (s.sort !== "soonest" ? 1 : 0);
}

export function hasAnyFilter(s: DiscoverState) {
  return serializeDiscoverParams(s).toString().length > 0;
}

export function sortLabel(sort: SortKey) {
  return SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Soonest first";
}
