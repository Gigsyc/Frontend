import type { Metadata } from "next";
import { Suspense } from "react";
import { OrganizerEventsScreen, OrganizerEventsScreenSkeleton } from "@/features/events/components/organizer/list";

export const metadata: Metadata = { title: "Your events" };

/** The screen reads ?status= from the URL, so it sits under a Suspense boundary for static rendering. */
export default function OrganizerEventsPage() {
  return (
    <Suspense fallback={<OrganizerEventsScreenSkeleton />}>
      <OrganizerEventsScreen />
    </Suspense>
  );
}
