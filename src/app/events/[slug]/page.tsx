import type { Metadata } from "next";
import { isPubliclyReachable } from "@/data/events";
import { eventBySlug } from "@/data/mocks/events";
import { EventDetailScreen } from "@/features/events/components/detail";

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = eventBySlug(slug);
  // Metadata is server-rendered from the seed, so it applies the same reachability
  // rule the store does: an event an admin has not published has no public title.
  if (!event || !isPubliclyReachable(event.status)) return { title: "Event" };
  return { title: event.title, description: event.tagline };
}

export default async function EventDetailPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  return <EventDetailScreen slug={slug} />;
}
