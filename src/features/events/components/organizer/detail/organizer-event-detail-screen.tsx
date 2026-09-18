"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, SearchX } from "lucide-react";
import { Button, EmptyState, ErrorState } from "@/components/ui";
import { useOrganizerEvent } from "@/features/events";
import { useEmployerSession } from "@/features/session";
import { CancelEventDialog, SubmitEventDialog } from "../list/organizer-event-dialogs";
import { isNotFound } from "../list/organizer-helpers";
import { OrganizerEventCallout } from "./organizer-event-callout";
import { OrganizerEventContent } from "./organizer-event-content";
import { OrganizerEventDetailSkeleton } from "./organizer-event-detail-skeleton";
import { OrganizerEventHeader } from "./organizer-event-header";
import { OrganizerEventSidebar } from "./organizer-event-sidebar";

/** /employer/events/[id] — one of the partner's events, read the way they'd talk about it. */
export function OrganizerEventDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { employerId } = useEmployerSession();
  const eventQ = useOrganizerEvent(employerId, id);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (eventQ.isPending) return <OrganizerEventDetailSkeleton />;
  if (eventQ.isError) {
    if (isNotFound(eventQ.error)) {
      return (
        <EmptyState
          icon={SearchX}
          title="That event isn't in your workspace"
          description="It may belong to another organiser, or the link is out of date."
          action={<Button asChild><Link href="/employer/events"><ChevronLeft /> Your events</Link></Button>}
          className="rounded-lg bg-surface shadow-card"
        />
      );
    }
    return <ErrorState title="We couldn't load this event" error={eventQ.error} onRetry={() => void eventQ.refetch()} retrying={eventQ.isRefetching} className="rounded-lg bg-surface shadow-card" />;
  }

  const event = eventQ.data;

  return (
    <div className="space-y-8">
      <OrganizerEventHeader event={event} onSubmit={() => setSubmitOpen(true)} onCancel={() => setCancelOpen(true)} />
      <OrganizerEventCallout event={event} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2"><OrganizerEventContent event={event} /></div>
        <OrganizerEventSidebar event={event} />
      </div>

      <SubmitEventDialog event={submitOpen ? event : null} onClose={() => setSubmitOpen(false)} />
      <CancelEventDialog
        event={cancelOpen ? event : null}
        onClose={() => setCancelOpen(false)}
        onDone={() => { if (event.status === "draft") router.push("/employer/events"); }}
      />
    </div>
  );
}
