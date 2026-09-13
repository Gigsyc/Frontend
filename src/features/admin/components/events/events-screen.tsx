"use client";

import { CalendarRange, RefreshCw, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from "@/components/ui";
import { useAdminEvents } from "@/features/admin/queries";
import { useEmployers } from "@/features/employers/queries";
import type { Event } from "@/types";
import { useAdminEventParams, type StatusTab } from "../../hooks/use-admin-event-params";
import { BulkActionBar } from "./bulk-action-bar";
import { EventActionDialogs, useEventActionFlow } from "./event-action-dialogs";
import { BULK_APPROVE, BULK_REJECT } from "./event-actions";
import { EventsTable, EventsTableSkeleton, type TableSelection } from "./events-table";
import { EventsToolbar } from "./events-toolbar";

const EMPTY_COPY: Record<StatusTab, { title: string; description: string }> = {
  all: { title: "No events yet", description: "The moment an organiser submits one it lands here." },
  pending_review: { title: "Nothing is waiting for review", description: "You're clear. New submissions arrive at the top of this tab." },
  published: { title: "Nothing is published", description: "Approve a submission and it goes live on /events straight away." },
  draft: { title: "No drafts", description: "Drafts are events organisers haven't sent in yet, plus anything you've unpublished." },
  rejected: { title: "Nothing rejected", description: "Rejected events keep the reason you wrote, so the decision stays explainable." },
  cancelled: { title: "Nothing cancelled", description: "Cancelled events stay reachable by link so ticket holders find out why." },
  completed: { title: "Nothing archived", description: "Events you archive once they've finished collect here." },
};

const EMPTY_EVENTS: Event[] = [];
const EMPTY_IDS: ReadonlySet<string> = new Set();

/** /admin/events — the review queue and the whole catalogue behind it. */
export function AdminEventsScreen() {
  const { state, baseFilters, listFilters, update, clear, activeCount } = useAdminEventParams();
  const countsQuery = useAdminEvents(baseFilters);
  const listQuery = useAdminEvents(listFilters);
  const employers = useEmployers();
  const flow = useEventActionFlow();
  const [selected, setSelected] = useState<ReadonlySet<string>>(EMPTY_IDS);

  const events = listQuery.data ?? EMPTY_EVENTS;
  const employerName = useMemo(() => new Map((employers.data ?? []).map((e) => [e.id, e.name])), [employers.data]);

  const tabCounts = useMemo(() => {
    const counts: Record<StatusTab, number> = { all: 0, pending_review: 0, published: 0, draft: 0, rejected: 0, cancelled: 0, completed: 0 };
    for (const e of countsQuery.data ?? []) { counts.all += 1; counts[e.status] += 1; }
    return counts;
  }, [countsQuery.data]);

  // Leaving the queue drops the ticks, so nothing ever comes back pre-selected. React's
  // "adjust state when something changes" pattern — a re-render, not an effect round trip.
  const [ticksTab, setTicksTab] = useState<StatusTab>(state.status);
  if (ticksTab !== state.status) {
    setTicksTab(state.status);
    setSelected(EMPTY_IDS);
  }

  // Ticks only exist on the review queue, so the bulk bar only ever counts rows that are on
  // screen with a checkbox beside them. Matching against the listed events also means approving
  // an event — which drops it off this tab — clears its own tick without any bookkeeping.
  const selectedEvents = useMemo(
    () => (state.status === "pending_review" ? events.filter((e) => selected.has(e.id)) : EMPTY_EVENTS),
    [events, selected, state.status],
  );
  const allSelected = events.length > 0 && selectedEvents.length === events.length;

  const selection: TableSelection | undefined = state.status === "pending_review"
    ? {
        selected,
        onToggle: (id) => setSelected((prev) => {
          const next = new Set(prev);
          if (!next.delete(id)) next.add(id);
          return next;
        }),
        onToggleAll: () => setSelected(allSelected ? new Set() : new Set(events.map((e) => e.id))),
        allSelected,
        someSelected: selectedEvents.length > 0,
      }
    : undefined;

  const filtered = activeCount > 0;
  const empty = EMPTY_COPY[state.status];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Events"
        description="Everything organisers have submitted, published or pulled. Approving an event here is what puts it on the public site."
        actions={<p className="hidden text-[13px] text-fg-muted sm:block">Organisers create events; you decide what goes live.</p>}
      />

      <Card>
        <EventsToolbar
          state={state}
          counts={countsQuery.data ? tabCounts : undefined}
          onChange={update}
          onClear={clear}
          activeCount={activeCount}
          resultCount={listQuery.data ? events.length : undefined}
        />

        {employers.isError ? (
          <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border bg-warning-50 px-4 py-2 text-[13px] text-warning-700 sm:px-5">
            <span>Organiser names didn&apos;t load, so that column is blank.</span>
            <Button variant="ghost" size="sm" onClick={() => void employers.refetch()} loading={employers.isRefetching}>
              <RefreshCw /> Try again
            </Button>
          </p>
        ) : null}

        {listQuery.isPending ? (
          <EventsTableSkeleton />
        ) : listQuery.isError ? (
          <ErrorState title="We couldn't load the events" error={listQuery.error} onRetry={() => void listQuery.refetch()} retrying={listQuery.isRefetching} />
        ) : events.length === 0 ? (
          filtered ? (
            <EmptyState
              compact
              icon={SearchX}
              title="No events match those filters"
              description="Try a different place or category, or clear the search."
              action={<Button variant="outline" size="sm" onClick={clear}>Clear filters</Button>}
            />
          ) : (
            <EmptyState compact icon={CalendarRange} title={empty.title} description={empty.description} />
          )
        ) : (
          <EventsTable
            events={events}
            organizerName={(id) => employerName.get(id) ?? (employers.isError ? "—" : "Unknown organiser")}
            onAction={(event, action) => flow.start([event], action)}
            onToggleFeatured={(event) => void flow.setFeatured(event, !event.featured)}
            pendingId={flow.pendingId}
            featuredPendingId={flow.featuredPendingId}
            selection={selection}
          />
        )}
      </Card>

      <BulkActionBar
        count={selectedEvents.length}
        busy={flow.isPending}
        onApprove={() => flow.start(selectedEvents, BULK_APPROVE, true)}
        onReject={() => flow.start(selectedEvents, BULK_REJECT, true)}
        onClear={() => setSelected(new Set())}
      />

      <EventActionDialogs pending={flow.pending} onCancel={flow.cancel} onConfirm={flow.confirm} busy={flow.isPending} />
    </div>
  );
}

/** Suspense fallback — the screen reads its filters from the URL. */
export function AdminEventsScreenSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading events">
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5">
          <Skeleton className="h-8 w-full max-w-xl rounded-md" />
          <Skeleton className="h-10 w-full max-w-72" />
        </div>
        <EventsTableSkeleton />
      </Card>
    </div>
  );
}
