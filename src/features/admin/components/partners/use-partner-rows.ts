"use client";

import { useMemo } from "react";
import { useAdminEvents, useAdminUsers } from "@/features/admin";
import { useEmployers } from "@/features/employers";
import type { AdminEventFilters, Employer, PlatformUser } from "@/types";

export interface PartnerRow {
  partner: Employer;
  /** The organiser account that manages this partner, when one exists. */
  contact?: PlatformUser;
  events: number;
  publishedEvents: number;
}

/** Two queries rather than one: the store owns the status filter, so this hook never re-derives it. */
const ALL_EVENTS: AdminEventFilters = {};
const PUBLISHED_ONLY: AdminEventFilters = { statuses: ["published"] };

/**
 * Partners are the same Employer records the workforce side uses, so their event count has to be
 * composed here from the admin events queries rather than read off the employer record.
 */
export function usePartnerRows() {
  const partners = useEmployers();
  const events = useAdminEvents(ALL_EVENTS);
  const published = useAdminEvents(PUBLISHED_ONLY);
  const users = useAdminUsers();

  const rows = useMemo<PartnerRow[]>(() => {
    const all = events.data ?? [];
    const live = published.data ?? [];
    return (partners.data ?? []).map((partner) => ({
      partner,
      contact: (users.data ?? []).find((u) => u.linkedEmployerId === partner.id),
      events: all.filter((e) => e.organizerId === partner.id).length,
      publishedEvents: live.filter((e) => e.organizerId === partner.id).length,
    }));
  }, [partners.data, events.data, published.data, users.data]);

  const queries = [partners, events, published, users];

  return {
    rows,
    isPending: queries.some((q) => q.isPending),
    isError: queries.some((q) => q.isError),
    error: queries.find((q) => q.isError)?.error ?? null,
    refetch: () => Promise.all(queries.map((q) => q.refetch())),
  };
}
