import type { Metadata } from "next";
import { OrganizerEventDetailScreen } from "@/features/events/components/organizer/detail";

export const metadata: Metadata = { title: "Event" };

export default async function OrganizerEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrganizerEventDetailScreen id={id} />;
}
