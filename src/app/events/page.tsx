import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsScreen, EventsScreenSkeleton } from "@/features/events/components/discovery";

export const metadata: Metadata = {
  title: "Events",
  description: "Concerts, festivals, markets, races and community days across Kigali, Musanze, Rubavu and the rest of Rwanda. Find something on this weekend.",
};

/** The board reads its filters from the URL, so it sits under a Suspense boundary for static rendering. */
export default function EventsPage() {
  return (
    <Suspense fallback={<EventsScreenSkeleton />}>
      <EventsScreen />
    </Suspense>
  );
}
