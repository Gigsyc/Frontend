import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminEventsScreen, AdminEventsScreenSkeleton } from "@/features/admin/components/events";

export const metadata: Metadata = { title: "Events" };

/** The screen reads ?status=, ?q=, ?category=, ?place= and ?sort= from the URL. */
export default function AdminEventsPage() {
  return (
    <Suspense fallback={<AdminEventsScreenSkeleton />}>
      <AdminEventsScreen />
    </Suspense>
  );
}
