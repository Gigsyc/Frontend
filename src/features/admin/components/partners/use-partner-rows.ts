"use client";

import { useMemo } from "react";
import { useAdminEvents, useAdminUsers } from "@/features/admin";
import { useEmployers } from "@/features/employers";
import type { Employer, PlatformUser } from "@/types";

export interface PartnerRow {
  partner: Employer;
  /** The organiser account that manages this partner, when one exists. */
  contact?: PlatformUser;
  events: number;
  publishedEvents: number;
}

/**
 * Partners are the same Employer records the workforce side uses, so their event count has to be
 * composed here from the admin events query rather than read off the employer record.
 */
export function usePartnerRows() {
  const partners = useEmployers();
  const events = useAdminEvents({});
  const users = useAdminUsers();

  const rows = useMemo<PartnerRow[]>(() => {
    const all = events.data ?? [];
    return (partners.data ?? []).map((partner) => ({
      partner,
      contact: (users.data ?? []).find((u) => u.linkedEmployerId === partner.id),
      events: all.filter((e) => e.organizerId === partner.id).length,
      publishedEvents: all.filter((e) => e.organizerId === partner.id && e.status === "published").length,
    }));
  }, [partners.data, events.data, users.data]);

  return {
    rows,
    isPending: partners.isPending || events.isPending || users.isPending,
    isError: partners.isError || events.isError || users.isError,
    error: partners.error ?? events.error ?? users.error,
    refetch: () => Promise.all([partners.refetch(), events.refetch(), users.refetch()]),
  };
}
