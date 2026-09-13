"use client";

import { useMemo } from "react";
import { isEventFree } from "@/components/common";
import { EVENT_CATEGORIES } from "@/data/events";
import { useAdminEvents, useAdminUsers, useReports } from "@/features/admin/queries";
import { useEmployers } from "@/features/employers/queries";
import type { Employer, Event, EventCategory, RwandaPlace } from "@/types";

export interface CategorySlice {
  category: EventCategory;
  label: string;
  count: number;
}

export interface PlaceSlice {
  place: RwandaPlace;
  count: number;
}

export interface OrganiserRow {
  partner: Employer;
  published: number;
  attending: number;
}

export interface PlatformTotals {
  published: number;
  attendance: number;
  free: number;
  paid: number;
  /** Percentage of published events that cost nothing to attend. */
  freeShare: number;
  activeUsers: number;
  totalUsers: number;
  /** Published events that are the subject of an open report. */
  flagged: number;
}

const EMPTY_EVENTS: Event[] = [];
const EMPTY_EMPLOYERS: Employer[] = [];

/**
 * Every number on /admin/analytics, composed from the queries that already exist. Nothing here is
 * invented: if a metric can't be derived from the events, users, partners and reports we hold, it
 * simply isn't on the page.
 */
export function usePlatformAnalytics() {
  const eventsQuery = useAdminEvents({});
  const usersQuery = useAdminUsers();
  const employersQuery = useEmployers();
  const reportsQuery = useReports();

  const published = useMemo(
    () => (eventsQuery.data ?? EMPTY_EVENTS).filter((e) => e.status === "published"),
    [eventsQuery.data],
  );

  const totals = useMemo<PlatformTotals>(() => {
    const users = usersQuery.data ?? [];
    const free = published.filter(isEventFree).length;
    const flaggedIds = new Set(
      (reportsQuery.data ?? []).filter((r) => r.status === "open" && r.kind === "event").map((r) => r.targetId),
    );
    return {
      published: published.length,
      attendance: published.reduce((sum, e) => sum + e.attending, 0),
      free,
      paid: published.length - free,
      freeShare: published.length ? Math.round((free / published.length) * 100) : 0,
      activeUsers: users.filter((u) => u.status === "active").length,
      totalUsers: users.length,
      flagged: published.filter((e) => flaggedIds.has(e.id)).length,
    };
  }, [published, usersQuery.data, reportsQuery.data]);

  const categories = useMemo<CategorySlice[]>(() => {
    const counts = new Map<EventCategory, number>();
    for (const e of published) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    return [...counts.entries()]
      .map(([category, count]) => ({ category, label: EVENT_CATEGORIES[category].label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [published]);

  const places = useMemo<PlaceSlice[]>(() => {
    const counts = new Map<RwandaPlace, number>();
    for (const e of published) counts.set(e.place, (counts.get(e.place) ?? 0) + 1);
    return [...counts.entries()]
      .map(([place, count]) => ({ place, count }))
      .sort((a, b) => b.count - a.count || a.place.localeCompare(b.place));
  }, [published]);

  const popular = useMemo(() => [...published].sort((a, b) => b.attending - a.attending).slice(0, 8), [published]);

  const organisers = useMemo<OrganiserRow[]>(() => {
    const partners = employersQuery.data ?? EMPTY_EMPLOYERS;
    return partners
      .map((partner) => {
        const mine = published.filter((e) => e.organizerId === partner.id);
        return { partner, published: mine.length, attending: mine.reduce((sum, e) => sum + e.attending, 0) };
      })
      .filter((row) => row.published > 0)
      .sort((a, b) => b.published - a.published || b.attending - a.attending)
      .slice(0, 5);
  }, [employersQuery.data, published]);

  const insights = useMemo<string[]>(() => {
    if (published.length === 0) return [];
    const lines: string[] = [];
    const [top, second] = categories;
    if (top && second) {
      lines.push(`${top.label} leads the calendar with ${top.count} of the ${published.length} published events, ahead of ${second.label.toLowerCase()} on ${second.count}.`);
    } else if (top) {
      lines.push(`Everything published sits in one category: ${top.label.toLowerCase()}, ${top.count} events.`);
    }
    lines.push(`${totals.freeShare}% of published events are free to attend — ${totals.free} free against ${totals.paid} paid.`);
    const [busiest] = places;
    if (busiest && places.length > 1) {
      lines.push(`${busiest.place} carries ${busiest.count} of the ${published.length} published events; the other ${published.length - busiest.count} are spread across ${places.length - 1} places.`);
    } else if (busiest) {
      lines.push(`Every published event is in ${busiest.place}. No other place has one on the calendar.`);
    }
    return lines;
  }, [categories, places, published.length, totals]);

  const queries = [eventsQuery, usersQuery, employersQuery, reportsQuery];

  return {
    isPending: queries.some((q) => q.isPending),
    isError: queries.some((q) => q.isError),
    error: queries.find((q) => q.isError)?.error,
    isRefetching: queries.some((q) => q.isRefetching),
    refetch: () => { for (const q of queries) void q.refetch(); },
    totals,
    categories,
    places,
    popular,
    organisers,
    insights,
  };
}
