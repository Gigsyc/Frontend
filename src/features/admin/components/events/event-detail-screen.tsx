"use client";

import Link from "next/link";
import { CalendarX2, MessageSquareWarning } from "lucide-react";
import {
  Button, Card, EmptyState, ErrorState, EventStatusBadge, PageHeader, Skeleton, type ButtonProps,
} from "@/components/ui";
import { useAdminEvent } from "@/features/admin/queries";
import { useEmployer } from "@/features/employers/queries";
import { formatTimeAgo, isNotFoundError } from "@/lib/utils";
import { EventActionDialogs, useEventActionFlow } from "./event-action-dialogs";
import { actionsFor, type EventActionDef } from "./event-actions";
import { EventDetailContent } from "./event-detail-content";
import { EventMetaCard } from "./event-detail-meta";

/** Actions that move an event towards the public site lead; everything else stays quiet. */
function variantFor(action: EventActionDef): ButtonProps["variant"] {
  if (action.destructive) return "danger-soft";
  return action.status === "published" || action.status === "pending_review" ? "primary" : "outline";
}

/** /admin/events/[id] — a review screen, not a second public page. */
export function AdminEventScreen({ id }: { id: string }) {
  const query = useAdminEvent(id);
  const event = query.data;
  const organizer = useEmployer(event?.organizerId);
  const flow = useEventActionFlow();

  if (query.isPending) return <AdminEventScreenSkeleton />;

  if (query.isError || !event) {
    return isNotFoundError(query.error) ? (
      <Card>
        <EmptyState
          icon={CalendarX2}
          title="We can't find that event"
          description="It may have been removed since this link was shared. The events list has everything we still hold."
          action={<Button asChild><Link href="/admin/events">Back to events</Link></Button>}
        />
      </Card>
    ) : (
      <Card>
        <ErrorState title="We couldn't load that event" error={query.error} onRetry={() => void query.refetch()} retrying={query.isRefetching} />
      </Card>
    );
  }

  const actions = actionsFor(event.status);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/events"
        backLabel="Events"
        eyebrow={organizer.data ? organizer.data.name : <span className="skeleton inline-block h-3.5 w-32 align-middle" aria-hidden />}
        title={event.title}
        actions={actions.map((a) => (
          // Approve, Publish, Archive and Move back to review fire without a dialog, so the
          // pressed button carries the spinner and its siblings just go quiet.
          <Button
            key={a.id}
            variant={variantFor(a)}
            onClick={() => flow.start([event], a)}
            loading={flow.runningActionId === a.id}
            disabled={flow.isPending}
          >
            <a.icon /> {a.label}
          </Button>
        ))}
      >
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-fg-muted">
          <EventStatusBadge status={event.status} />
          <span aria-hidden>·</span>
          <span>{event.venue}, {event.place}</span>
        </div>
      </PageHeader>

      {event.reviewNote ? (
        <div className="rounded-lg border border-warning-100 bg-warning-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-warning-700">
            <MessageSquareWarning className="size-4" aria-hidden /> Review note
          </p>
          <p className="mt-1.5 text-sm leading-6 text-warning-700">{event.reviewNote}</p>
          <p className="mt-2 text-xs text-warning-600">
            GigSyc operations{event.reviewedAt ? ` · ${formatTimeAgo(event.reviewedAt)}` : ""}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <EventDetailContent event={event} />
        <EventMetaCard
          event={event}
          organizer={organizer.data}
          onToggleFeatured={() => void flow.setFeatured(event, !event.featured)}
          featuredBusy={flow.featuredPendingId === event.id}
        />
      </div>

      <EventActionDialogs pending={flow.pending} onCancel={flow.cancel} onConfirm={flow.confirm} busy={flow.isPending} />
    </div>
  );
}

export function AdminEventScreenSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading the event record">
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="space-y-5 p-5">
          <Skeleton className="aspect-video w-full max-w-[360px] rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
          <Skeleton className="h-28 w-full rounded-md" />
        </Card>
        <Card className="space-y-4 p-5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
