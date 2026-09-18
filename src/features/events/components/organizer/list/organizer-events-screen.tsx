"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CalendarRange, Plus } from "lucide-react";
import { Button, Card, EmptyState, ErrorState, PageHeader, Photo, Segmented, Skeleton } from "@/components/ui";
import { IMAGES } from "@/data/images";
import { useOrganizerEvents } from "@/features/events";
import { useEmployerSession } from "@/features/session";
import type { Event } from "@/types";
import { CancelEventDialog, SubmitEventDialog } from "./organizer-event-dialogs";
import { countByFilter, EMPTY_COPY, groupByFilter, isStatusFilter, pickUpNext, STATUS_FILTERS, type OrganizerStatusFilter } from "./organizer-helpers";
import { OrganizerEventsTable, OrganizerEventsTableSkeleton } from "./organizer-events-table";
import { UpNextCard, UpNextCardSkeleton } from "./up-next-card";

const NewEventButton = () => (
  <Button asChild><Link href="/employer/events/new"><Plus /> Submit an event</Link></Button>
);

/** /employer/events — every event this partner has listed, led by the one coming up next. Filter lives in ?status=. */
export function OrganizerEventsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { employerId } = useEmployerSession();
  const eventsQ = useOrganizerEvents(employerId);
  const [submitting, setSubmitting] = useState<Event | null>(null);
  const [cancelling, setCancelling] = useState<Event | null>(null);

  const filter: OrganizerStatusFilter = isStatusFilter(sp.get("status")) ? (sp.get("status") as OrganizerStatusFilter) : "all";
  const setFilter = useCallback(
    (next: OrganizerStatusFilter) => {
      const params = new URLSearchParams(sp.toString());
      if (next === "all") params.delete("status");
      else params.set("status", next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [sp, router, pathname],
  );

  const events = useMemo(() => eventsQ.data ?? [], [eventsQ.data]);
  const counts = useMemo(() => countByFilter(events), [events]);
  const visible = useMemo(() => groupByFilter(events, filter), [events, filter]);
  const upNext = useMemo(() => pickUpNext(events), [events]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your events"
        description="Everything you've listed with GigSyc — live, waiting for review, still a draft or already finished. We review every event before it goes live."
        actions={<NewEventButton />}
      />

      {eventsQ.isPending ? (
        <>
          <UpNextCardSkeleton />
          <Card><div className="border-b border-border p-4 sm:p-5"><Skeleton className="h-8 w-96 max-w-full rounded-md" /></div><OrganizerEventsTableSkeleton /></Card>
        </>
      ) : eventsQ.isError ? (
        <Card><ErrorState title="We couldn't load your events" error={eventsQ.error} onRetry={() => void eventsQ.refetch()} retrying={eventsQ.isRefetching} /></Card>
      ) : events.length === 0 ? (
        <Card className="overflow-hidden">
          <Photo src={IMAGES.eventDecor} alt="A decorated event venue ready for guests" aspect="wide" rounded={false} sizes="(max-width: 1024px) 100vw, 960px" />
          <EmptyState
            icon={CalendarRange}
            title="You haven't listed an event yet"
            description="Tell guests what you're putting on. GigSyc reviews every event before it goes live, usually within a day."
            action={<NewEventButton />}
          />
        </Card>
      ) : (
        <>
          {upNext ? <UpNextCard event={upNext} /> : null}

          <Card>
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <Segmented
                  ariaLabel="Filter events by status"
                  value={filter}
                  onChange={setFilter}
                  options={STATUS_FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
                />
              </div>
              <span className="hidden text-sm text-fg-muted tabular sm:block">{visible.length} {visible.length === 1 ? "event" : "events"}</span>
            </div>

            {visible.length === 0 ? (
              <EmptyState
                compact
                icon={CalendarRange}
                title={EMPTY_COPY[filter].title}
                description={EMPTY_COPY[filter].description}
                action={filter !== "all" ? <Button variant="outline" size="sm" onClick={() => setFilter("all")}>Show all events</Button> : undefined}
              />
            ) : (
              <OrganizerEventsTable events={visible} onSubmit={setSubmitting} onCancel={setCancelling} />
            )}
          </Card>
        </>
      )}

      <SubmitEventDialog event={submitting} onClose={() => setSubmitting(null)} />
      <CancelEventDialog event={cancelling} onClose={() => setCancelling(null)} />
    </div>
  );
}

/** Suspense fallback for the page — the screen reads ?status= from the URL. */
export function OrganizerEventsScreenSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading your events">
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <UpNextCardSkeleton />
      <Card>
        <div className="border-b border-border p-4 sm:p-5"><Skeleton className="h-8 w-96 max-w-full rounded-md" /></div>
        <OrganizerEventsTableSkeleton />
      </Card>
    </div>
  );
}
