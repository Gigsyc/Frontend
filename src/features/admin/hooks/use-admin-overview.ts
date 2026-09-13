"use client";

import { format } from "date-fns";
import { useMemo } from "react";
import { useAdminEvents, useAdminUsers, useReports, useSystemServices } from "@/features/admin/queries";
import { useEmployers } from "@/features/employers/queries";
import type { Employer, Event, EventStatus, PlatformRole, RwandaPlace } from "@/types";

export type AttentionKind = "moderation" | "service" | "review_queue" | "partners" | "users";

export interface AttentionRow {
  id: string;
  kind: AttentionKind;
  /** Bold half of the row — a count, or the name of the service that is misbehaving. */
  lead: string;
  label: string;
  detail: string;
  href: string;
}

export interface ActivityItem {
  id: string;
  kind: "review" | "user" | "report";
  lead: string;
  rest: string;
  /** ISO date or timestamp — mixed precision, sorted as text. */
  at: string;
  href: string;
}

export interface OverviewStats {
  /** Published and not yet finished — exactly what /events is showing. */
  liveEvents: number;
  thisMonth: number;
  monthName: string;
  activeUsers: number;
  pendingUsers: number;
  partners: number;
  unverifiedPartners: number;
}

export interface DestinationShare {
  place: RwandaPlace;
  count: number;
  /** 0–100, relative to the busiest place. */
  share: number;
}

const REVIEW_VERB: Record<EventStatus, string> = {
  published: "was approved and published",
  rejected: "was rejected",
  pending_review: "was moved back to review",
  draft: "was unpublished back to draft",
  cancelled: "was cancelled",
  completed: "was archived as completed",
};

const ROLE_WORD: Record<PlatformRole, string> = {
  customer: "joined as a customer",
  organizer: "joined as an organiser",
  professional: "joined as a professional",
  admin: "joined the operations team",
};

const SERVICE_WORD = { degraded: "is degraded", down: "is down", maintenance: "is in maintenance", operational: "is fine" } as const;

const EMPTY_EVENTS: Event[] = [];
const EMPTY_EMPLOYERS: Employer[] = [];

/** Events the public site is showing right now: published and not yet finished. */
const isLive = (e: Event, today: string) => e.status === "published" && (e.endDate ?? e.date) >= today;

/**
 * Everything /admin needs in one read. Composed from the existing admin and employer
 * queries — every number on the Overview is derived here so the page stays presentational.
 */
export function useAdminOverview() {
  const eventsQuery = useAdminEvents({});
  const usersQuery = useAdminUsers();
  const reportsQuery = useReports();
  const servicesQuery = useSystemServices();
  const employersQuery = useEmployers();

  const events = eventsQuery.data ?? EMPTY_EVENTS;
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const reports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);
  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const employers = employersQuery.data ?? EMPTY_EMPLOYERS;

  const employerById = useMemo(() => new Map(employers.map((e) => [e.id, e])), [employers]);

  const attention = useMemo<AttentionRow[]>(() => {
    const openReports = reports.filter((r) => r.status === "open").length;
    const broken = services.filter((s) => s.status !== "operational");
    const pendingEvents = events.filter((e) => e.status === "pending_review").length;
    const unverified = employers.filter((e) => !e.verified).length;
    const pendingUsers = users.filter((u) => u.status === "pending").length;

    const rows: AttentionRow[] = [];
    if (openReports > 0) {
      rows.push({
        id: "moderation", kind: "moderation", lead: String(openReports),
        label: openReports === 1 ? "reported listing" : "reported listings",
        detail: "Customers flagged these and nobody has decided yet.",
        href: "/admin/moderation",
      });
    }
    for (const s of broken) {
      rows.push({
        id: `service_${s.id}`, kind: "service", lead: s.name, label: SERVICE_WORD[s.status],
        detail: s.note ?? `${s.description} is not running normally.`,
        href: "/admin/system",
      });
    }
    if (pendingEvents > 0) {
      rows.push({
        id: "review_queue", kind: "review_queue", lead: String(pendingEvents),
        label: pendingEvents === 1 ? "event awaiting approval" : "events awaiting approval",
        detail: "Organisers submitted these and can't sell a ticket until you decide.",
        href: "/admin/events?status=pending_review",
      });
    }
    if (unverified > 0) {
      rows.push({
        id: "partners", kind: "partners", lead: String(unverified),
        label: unverified === 1 ? "partner verification request" : "partner verification requests",
        detail: "Organisations waiting on document checks before they show as verified.",
        href: "/admin/partners",
      });
    }
    if (pendingUsers > 0) {
      rows.push({
        id: "users", kind: "users", lead: String(pendingUsers),
        label: pendingUsers === 1 ? "user pending" : "users pending",
        detail: "New accounts that can't sign in until someone approves them.",
        href: "/admin/users",
      });
    }
    return rows;
  }, [events, employers, reports, services, users]);

  const stats = useMemo<OverviewStats>(() => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");
    const month = format(now, "yyyy-MM");
    return {
      liveEvents: events.filter((e) => isLive(e, today)).length,
      thisMonth: events.filter((e) => e.date.startsWith(month) && (e.status === "published" || e.status === "completed")).length,
      monthName: format(now, "MMMM"),
      activeUsers: users.filter((u) => u.status === "active").length,
      pendingUsers: users.filter((u) => u.status === "pending").length,
      partners: employers.length,
      unverifiedPartners: employers.filter((e) => !e.verified).length,
    };
  }, [events, employers, users]);

  const recentSubmissions = useMemo(
    () => events.filter((e) => e.submittedAt).sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? "")).slice(0, 5),
    [events],
  );

  const upcoming = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return events.filter((e) => e.status === "published" && e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  }, [events]);

  const activity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];
    for (const e of events) {
      if (e.reviewedAt) items.push({ id: `rv_${e.id}`, kind: "review", lead: e.title, rest: REVIEW_VERB[e.status], at: e.reviewedAt, href: `/admin/events/${e.id}` });
    }
    for (const u of users) items.push({ id: `us_${u.id}`, kind: "user", lead: u.name, rest: ROLE_WORD[u.role], at: u.joinedAt, href: "/admin/users" });
    for (const r of reports) items.push({ id: `rp_${r.id}`, kind: "report", lead: r.targetLabel, rest: `was reported for ${r.reason.toLowerCase()}`, at: r.createdAt, href: "/admin/moderation" });
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  }, [events, reports, users]);

  const destinations = useMemo<DestinationShare[]>(() => {
    const counts = new Map<RwandaPlace, number>();
    for (const e of events) if (e.status === "published") counts.set(e.place, (counts.get(e.place) ?? 0) + 1);
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    const max = top[0]?.[1] ?? 1;
    return top.map(([place, count]) => ({ place, count, share: Math.round((count / max) * 100) }));
  }, [events]);

  const queries = [eventsQuery, usersQuery, reportsQuery, servicesQuery, employersQuery];

  return {
    isPending: queries.some((q) => q.isPending),
    isError: queries.some((q) => q.isError),
    error: queries.find((q) => q.isError)?.error,
    isRefetching: queries.some((q) => q.isRefetching),
    refetch: () => { for (const q of queries) void q.refetch(); },
    attention,
    stats,
    recentSubmissions,
    upcoming,
    activity,
    destinations,
    organizerName: (id: string) => employerById.get(id)?.name ?? "Unknown organiser",
  };
}
