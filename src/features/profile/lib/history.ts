import type { WorkHistoryItem } from "@/types";

export const sortNewestFirst = (items: WorkHistoryItem[]) => [...items].sort((a, b) => b.date.localeCompare(a.date));

export interface HistorySummary {
  /** Hours on the verified shifts we list. */
  listedHours: number;
  /** Total hours across all completed shifts, extrapolated from the listed ones when history is partial. */
  totalHours: number;
  isEstimate: boolean;
  average: number | null;
  ratedCount: number;
}

export function historySummary(items: WorkHistoryItem[], completedShifts: number): HistorySummary {
  const listedHours = items.reduce((a, i) => a + i.hours, 0);
  const rated = items.filter((i) => typeof i.rating === "number");
  const average = rated.length ? rated.reduce((a, i) => a + (i.rating ?? 0), 0) / rated.length : null;
  const isEstimate = completedShifts > items.length && items.length > 0;
  const perShift = items.length ? listedHours / items.length : 0;
  const totalHours = isEstimate ? Math.round((perShift * completedShifts) / 10) * 10 : listedHours;
  return { listedHours, totalHours, isEstimate, average, ratedCount: rated.length };
}

export interface RatingBucket {
  stars: number;
  count: number;
  pct: number;
}

/** 5→1 star buckets. Half stars round down: a 4.5 is not a five. */
export function ratingDistribution(items: WorkHistoryItem[]): { buckets: RatingBucket[]; total: number } {
  const counts = new Map<number, number>([[5, 0], [4, 0], [3, 0], [2, 0], [1, 0]]);
  for (const it of items) {
    if (typeof it.rating !== "number") continue;
    const s = Math.min(5, Math.max(1, Math.floor(it.rating)));
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  const buckets = [5, 4, 3, 2, 1].map((stars) => {
    const count = counts.get(stars) ?? 0;
    return { stars, count, pct: total ? (count / total) * 100 : 0 };
  });
  return { buckets, total };
}
