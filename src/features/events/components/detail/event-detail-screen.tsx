"use client";

import Link from "next/link";
import { ChevronLeft, SearchX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { useEmployer } from "@/features/employers/queries";
import { useCustomerSession } from "@/features/session";
import { errorMessage, isNotFoundError } from "@/lib/utils";
import type { Event } from "@/types";
import { useEvent, useSavedEventIds, useToggleSavedEvent } from "../../queries";
import { AttendDialog } from "./attend-dialog";
import { EventActionBar, EventActionCard, EventSecondaryActions } from "./event-action-panel";
import { EventDetailSkeleton } from "./event-detail-skeleton";
import { EventGallery } from "./event-gallery";
import { EventHero, EventTitleBlock } from "./event-hero";
import { EventOrganizerCard, EventStaffedCard } from "./event-organizer-card";
import { EventRelated } from "./event-related";
import { EventAbout, EventGoodToKnow, EventWhenWhere } from "./event-sections";
import { EventTickets } from "./event-tickets";

/** /events/[slug] — read the event, then make the next action unmissable on any screen. */
export function EventDetailScreen({ slug }: { slug: string }) {
  const { userId } = useCustomerSession();
  const eventQ = useEvent(slug);
  const event = eventQ.data;
  const organizerQ = useEmployer(event?.organizerId);
  const savedQ = useSavedEventIds(userId);
  const toggleSaved = useToggleSavedEvent(userId);

  const [attendOpen, setAttendOpen] = useState(false);
  const [attended, setAttended] = useState(false);

  const savedIds = savedQ.data ?? [];
  const toggleSave = (target: Event) => {
    toggleSaved.mutate(target.id, {
      onSuccess: ({ saved }) =>
        saved
          ? toast.success(`Saved ${target.title}`, { description: "Find it again under your saved events." })
          : toast.success(`Removed ${target.title} from saved`),
      onError: (err) => toast.error(errorMessage(err, "We couldn't update your saved events. Try again.")),
    });
  };

  if (eventQ.isPending) return <EventDetailSkeleton />;

  if (eventQ.isError) {
    const shell = "container-x my-8 rounded-lg bg-surface shadow-card";
    if (isNotFoundError(eventQ.error)) {
      return (
        <EmptyState
          icon={SearchX}
          title="We couldn't find that event"
          description="It may have been taken down or has not been published yet."
          action={<Button asChild><Link href="/events"><ChevronLeft /> Browse all events</Link></Button>}
          className={shell}
        />
      );
    }
    return (
      <ErrorState
        title="We couldn't load this event"
        error={eventQ.error}
        onRetry={() => void eventQ.refetch()}
        retrying={eventQ.isRefetching}
        className={shell}
      />
    );
  }

  const saved = savedIds.includes(eventQ.data.id);
  const actionProps = {
    event: eventQ.data,
    attended,
    saved,
    savePending: toggleSaved.isPending,
    onAttend: () => setAttendOpen(true),
    onToggleSave: () => toggleSave(eventQ.data),
  };

  return (
    <div className="container-x space-y-8 py-6 sm:py-8">
      <Link href="/events" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-fg-muted transition-colors hover:text-fg">
        <ChevronLeft className="size-4" aria-hidden /> All events
      </Link>

      <EventHero event={eventQ.data} />
      <EventTitleBlock event={eventQ.data} organizer={organizerQ.data} organizerPending={organizerQ.isPending} />
      <EventSecondaryActions {...actionProps} className="max-w-sm lg:hidden" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:items-start lg:gap-10">
        <div className="space-y-8">
          <EventAbout event={eventQ.data} />
          <EventWhenWhere event={eventQ.data} />
          <EventTickets event={eventQ.data} />
          <EventGoodToKnow event={eventQ.data} />
          <EventOrganizerCard organizer={organizerQ.data} isPending={organizerQ.isPending} />
          <EventGallery title={eventQ.data.title} images={eventQ.data.gallery} />
          <EventStaffedCard shiftIds={eventQ.data.staffedShiftIds.slice(0, 2)} />
        </div>

        <div className="hidden lg:sticky lg:top-24 lg:block">
          <EventActionCard {...actionProps} />
        </div>
      </div>

      <EventRelated
        event={eventQ.data}
        savedIds={savedIds}
        onToggleSave={toggleSave}
        prominent={eventQ.data.status === "completed"}
      />

      <EventActionBar event={eventQ.data} attended={attended} onAttend={() => setAttendOpen(true)} />

      <AttendDialog
        open={attendOpen}
        onOpenChange={setAttendOpen}
        event={eventQ.data}
        onAttended={() => setAttended(true)}
      />
    </div>
  );
}
