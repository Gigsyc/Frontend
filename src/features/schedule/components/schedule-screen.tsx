"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ErrorState, PageHeader, Segmented } from "@/components/ui";
import { useWorkerSession } from "@/features/session";
import { useWorker } from "@/features/workers";
import { pluralize } from "@/lib/utils";
import type { DayMarker, ScheduleItem, ScheduleSegment } from "../types";
import { useWorkerSchedule } from "../use-worker-schedule";
import { RateEmployerDialog } from "./rate-employer-dialog";
import { dayAnchor, PastList, PendingList, UpcomingList } from "./schedule-segments";
import { ScheduleSkeleton } from "./schedule-skeleton";
import { TodayCard } from "./today-card";
import { WeekStrip } from "./week-strip";
import { WithdrawDialog } from "./withdraw-dialog";

const EASE = [0.22, 1, 0.36, 1] as const;

/** /worker/schedule — today's shift, the week ahead, and everything confirmed, pending or past. */
export function ScheduleScreen() {
  const { workerId } = useWorkerSession();
  const schedule = useWorkerSchedule(workerId);
  const { data: worker } = useWorker(workerId);

  const [segment, setSegment] = useState<ScheduleSegment>("upcoming");
  const [withdrawing, setWithdrawing] = useState<ScheduleItem | null>(null);
  const [rating, setRating] = useState<ScheduleItem | null>(null);
  const scrollTarget = useRef<string | null>(null);

  // After a week-strip tap switches segment, wait for the new list to mount and then scroll to the day.
  useEffect(() => {
    const id = scrollTarget.current;
    if (!id) return;
    scrollTarget.current = null;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [segment, schedule.data]);

  const jumpToDay = useCallback(
    (date: string, marker: DayMarker) => {
      const today = schedule.data?.today;
      if (today && today.shift.date === date) {
        document.getElementById("today-shift")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const target: ScheduleSegment = marker === "confirmed" ? "upcoming" : "pending";
      if (target === segment) {
        // The list is already mounted; setSegment would bail out and the effect below would never run.
        document.getElementById(dayAnchor(date))?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      scrollTarget.current = dayAnchor(date);
      setSegment(target);
    },
    [schedule.data?.today, segment],
  );

  const description = useMemo(() => {
    if (!schedule.data) return undefined;
    const { counts, today } = schedule.data;
    const confirmed = counts.upcoming + (today ? 1 : 0);
    if (confirmed === 0 && counts.pending === 0) return "Nothing booked yet — your next shift is one application away.";
    const parts = [pluralize(confirmed, "confirmed shift")];
    if (counts.pending) parts.push(`${counts.pending} waiting on a reply`);
    return parts.join(" · ");
  }, [schedule.data]);

  if (schedule.isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Your shifts" />
        <ScheduleSkeleton />
      </div>
    );
  }

  if (schedule.isError || !schedule.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Your shifts" />
        <ErrorState title="We couldn't load your shifts" error={schedule.error} onRetry={schedule.refetch} retrying={schedule.isRefetching} />
      </div>
    );
  }

  const { today, upcoming, pending, past, counts, dayMarkers } = schedule.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Your shifts" description={description} />

      {today ? <TodayCard item={today} /> : null}

      <WeekStrip markers={dayMarkers} onSelect={jumpToDay} />

      <div className="space-y-4">
        <Segmented<ScheduleSegment>
          ariaLabel="Filter shifts"
          value={segment}
          onChange={setSegment}
          className="w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none"
          options={[
            { value: "upcoming", label: "Upcoming", count: counts.upcoming },
            { value: "pending", label: "Pending", count: counts.pending },
            { value: "past", label: "Past", count: counts.past },
          ]}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={segment}
            role="tabpanel"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {segment === "upcoming" ? <UpcomingList groups={upcoming} onWithdraw={setWithdrawing} /> : null}
            {segment === "pending" ? <PendingList items={pending} onWithdraw={setWithdrawing} /> : null}
            {segment === "past" ? <PastList items={past} onRate={setRating} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <WithdrawDialog item={withdrawing} onOpenChange={(o) => !o && setWithdrawing(null)} reliability={worker?.reliability} />
      <RateEmployerDialog item={rating} onOpenChange={(o) => !o && setRating(null)} />
    </div>
  );
}
