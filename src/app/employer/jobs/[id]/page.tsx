import type { Metadata } from "next";
import { Suspense } from "react";
import { JobDetailScreen, JobDetailSkeleton } from "@/features/shifts/components/employer";

export const metadata: Metadata = { title: "Shift" };

/** The screen reads ?tab= from the URL, so it sits under a Suspense boundary for static rendering. */
export default async function JobDetailPage({ params }: PageProps<"/employer/jobs/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<JobDetailSkeleton />}>
      <JobDetailScreen id={id} />
    </Suspense>
  );
}
