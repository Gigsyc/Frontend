"use client";

import Link from "next/link";
import { ChevronLeft, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { useEmployer } from "@/features/employers/queries";
import { isNotFoundError } from "@/lib/utils";
import type { Event } from "@/types";
import { useSavedEvents } from "../../hooks";
import { useEvent } from "../../queries";
import { AttendDialog } from "./attend-dialog";
import { AttendanceLine, EventActionBar, EventActionCard, EventSecondaryActions, EventStatusNotice } from "./event-action-panel";
import { EventDetailSkeleton } from "./event-detail-skeleton";
import { EventGallery } from "./event-gallery";
import { EventHero, EventTitleBlock } from "./event-hero";
import { EventOrganizerCard, EventStaffedCard } from "./event-organizer-card";
import { EventRelated } from "./event-related";
import { EventAbout, EventGoodToKnow, EventWhenWhere } from "./event-sections";
import { EventTickets } from "./event-tickets";
import { isEventLive } from "./utils";

/** /events/[slug] — read the event, then make the next action unmissable on any screen. */
export function EventDetailScreen({ slug, initialEvent }: { slug: string; initialEvent?: Event }) {
  const eventQ = useEvent(slug, initialEvent);
  const event = eventQ.data;
  const organizerQ = useEmployer(event?.organizerId);
  const { savedIds, toggleSave, isSavingEvent } = useSavedEvents();

  const [attendOpen, setAttendOpen] = useState(false);
  const [attended, setAttended] = useState(false);

  // The server titles the page from the seed; the store is what knows whether an admin has
  // since pulled the event, so the client re-states the title once the real answer lands.
  useEffect(() => {
    if (event) document.title = `${event.title} · GigSyc`;
  }, [event]);

  if (eventQ.isPending) return <EventDetailSkeleton />;

  if (eventQ.isError) {
    const card = "mx-auto max-w-xl rounded-lg bg-surface shadow-card";
    return (
      <div className="bg-canvas pb-16">
        <div className="container-x py-10">
          {isNotFoundError(eventQ.error) ? (
            <EmptyState
              icon={SearchX}
              title="We couldn't find that event"
              description="It may have been taken down or has not been published yet."
              action={<Button asChild><Link href="/events"><ChevronLeft /> Browse all events</Link></Button>}
              className={card}
            />
          ) : (
            <ErrorState
              title="We couldn't load this event"
              error={eventQ.error}
              onRetry={() => void eventQ.refetch()}
              retrying={eventQ.isRefetching}
              className={card}
            />
          )}
        </div>
      </div>
    );
  }

  const live = isEventLive(eventQ.data);
  const actionProps = {
    event: eventQ.data,
    attended,
    saved: savedIds.has(eventQ.data.id),
    savePending: isSavingEvent(eventQ.data),
    onAttend: () => setAttendOpen(true),
    onToggleSave: () => toggleSave(eventQ.data),
  };

  return (
    <div className="bg-canvas pb-16">
      <div className="container-x space-y-8 py-6 sm:py-8">
        <Link href="/events" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-fg-muted transition-colors hover:text-fg">
          <ChevronLeft className="size-4" aria-hidden /> All events
        </Link>

        <EventHero event={eventQ.data} />
        <EventTitleBlock event={eventQ.data} organizer={organizerQ.data} organizerPending={organizerQ.isPending} />

        {/* Both of these live in the page flow so they reach phones, where the rail is hidden. */}
        {live ? (
          <AttendanceLine event={eventQ.data} className="max-w-sm lg:hidden" />
        ) : (
          <EventStatusNotice event={eventQ.data} className="max-w-xl" />
        )}
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
          prominent={!live}
        />

        <EventActionBar event={eventQ.data} attended={attended} onAttend={() => setAttendOpen(true)} />

        <AttendDialog
          open={attendOpen}
          onOpenChange={setAttendOpen}
          event={eventQ.data}
          onAttended={() => setAttended(true)}
        />
      </div>
    </div>
  );
}
