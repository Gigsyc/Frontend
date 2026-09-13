import type { AdminEventFilters, EventFilters, ShiftFilters, WorkerFilters } from "@/types";

/** Central query-key factory. Invalidate by prefix, e.g. qk.shifts.all. */
export const qk = {
  employers: {
    all: ["employers"] as const,
    detail: (id: string) => ["employers", id] as const,
  },
  shifts: {
    all: ["shifts"] as const,
    open: (f: ShiftFilters) => ["shifts", "open", f] as const,
    byEmployer: (employerId: string, f?: ShiftFilters) => ["shifts", "employer", employerId, f ?? {}] as const,
    detail: (id: string) => ["shifts", "detail", id] as const,
    candidates: (id: string) => ["shifts", "candidates", id] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    byShift: (shiftId: string) => ["bookings", "shift", shiftId] as const,
    byWorker: (workerId: string) => ["bookings", "worker", workerId] as const,
    byEmployer: (employerId: string) => ["bookings", "employer", employerId] as const,
  },
  workers: {
    all: ["workers"] as const,
    list: (f: WorkerFilters) => ["workers", "list", f] as const,
    detail: (id: string) => ["workers", id] as const,
  },
  talentPool: {
    all: ["talentPool"] as const,
    byEmployer: (employerId: string) => ["talentPool", employerId] as const,
  },
  payouts: {
    byWorker: (workerId: string) => ["payouts", workerId] as const,
  },
  invoices: {
    all: ["invoices"] as const,
    byEmployer: (employerId: string) => ["invoices", employerId] as const,
    detail: (id: string) => ["invoices", "detail", id] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    byRecipient: (id: string) => ["notifications", id] as const,
  },
  events: {
    all: ["events"] as const,
    public: (f: EventFilters) => ["events", "public", f] as const,
    past: ["events", "past"] as const,
    detail: (slug: string) => ["events", "detail", slug] as const,
    related: (id: string) => ["events", "related", id] as const,
    saved: (userId: string) => ["events", "saved", userId] as const,
  },
  destinations: {
    all: ["destinations"] as const,
    list: (publishedOnly: boolean) => ["destinations", { publishedOnly }] as const,
    detail: (slug: string) => ["destinations", "detail", slug] as const,
  },
  admin: {
    all: ["admin"] as const,
    events: (f: AdminEventFilters) => ["admin", "events", f] as const,
    event: (id: string) => ["admin", "events", "detail", id] as const,
    users: ["admin", "users"] as const,
    user: (id: string) => ["admin", "users", id] as const,
    reports: ["admin", "reports"] as const,
    system: ["admin", "system"] as const,
  },
};
