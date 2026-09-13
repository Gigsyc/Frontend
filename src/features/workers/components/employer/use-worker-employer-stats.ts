"use client";

import { useMemo } from "react";
import { useEmployerBookings } from "@/features/bookings";

export interface WorkerEmployerStats {
  isPending: boolean;
  /** Shifts this worker completed for this employer */
  completed: number;
  /** Confirmed for an upcoming shift */
  upcoming: number;
  pendingInvites: number;
  applied: number;
  noShows: number;
  /** Mean of the ratings this employer gave, if any */
  avgRating?: number;
}

/** What this employer's own bookings say about a worker — derived locally from useEmployerBookings. */
export function useWorkerEmployerStats(employerId: string, workerId: string): WorkerEmployerStats {
  const bookings = useEmployerBookings(employerId);
  return useMemo(() => {
    const mine = (bookings.data ?? []).filter((b) => b.workerId === workerId);
    const completed = mine.filter((b) => b.status === "completed");
    const scores = completed.map((b) => b.employerRating?.score).filter((s): s is number => typeof s === "number");
    return {
      isPending: bookings.isPending,
      completed: completed.length,
      upcoming: mine.filter((b) => b.status === "confirmed").length,
      pendingInvites: mine.filter((b) => b.status === "invited").length,
      applied: mine.filter((b) => b.status === "applied").length,
      noShows: mine.filter((b) => b.status === "no_show").length,
      avgRating: scores.length ? scores.reduce((a, s) => a + s, 0) / scores.length : undefined,
    };
  }, [bookings.data, bookings.isPending, workerId]);
}
