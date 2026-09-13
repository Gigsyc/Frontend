"use client";

import { useMemo } from "react";
import { useEvents } from "../queries";
import { eventMatchesWhen } from "@/data/events";

/**
 * The next few events, for surfaces that show a short rail rather than the full board.
 * Prefers the coming week; falls back to everything upcoming when the week is thin, so the
 * homepage never shows two events where it expects four.
 */
export function useUpcomingEvents(limit = 4) {
  const query = useEvents({ sort: "soonest" });

  const events = useMemo(() => {
    const all = query.data;
    if (!all) return undefined;
    const week = all.filter((e) => eventMatchesWhen(e, "week"));
    return (week.length >= limit ? week : all).slice(0, limit);
  }, [query.data, limit]);

  return { events, isPending: query.isPending, isError: query.isError };
}
