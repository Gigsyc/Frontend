import type { Metadata } from "next";
import { isPubliclyReachable } from "@/data/events";
import { eventBySlug } from "@/data/mocks/events";
import { EventDetailScreen } from "@/features/events/components/detail";

/**
 * The seed's answer to "is this event public?", used for the server render only.
 *
 * An admin's publish, reject or archive lands in the browser store, which the server cannot
 * read — so this is a first-paint hint, never the verdict. Anything the seed does not already
 * consider public renders nothing here, so a draft or rejected listing never reaches the HTML
 * even for a moment; `EventDetailScreen` refetches on mount and the store has the last word.
 */
function seedEvent(slug: string) {
  const event = eventBySlug(slug);
  return event && isPubliclyReachable(event.status) ? event : undefined;
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = seedEvent(slug);
  if (!event) return { title: "Event", description: "Event details, tickets and directions on GigSyc." };
  return { title: event.title, description: event.tagline };
}

export default async function EventDetailPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  return <EventDetailScreen slug={slug} initialEvent={seedEvent(slug)} />;
}
