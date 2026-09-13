import type { Metadata } from "next";
import { Suspense } from "react";
import { JobsScreen, JobsScreenSkeleton } from "@/features/shifts/components/employer/jobs-screen";

export const metadata: Metadata = { title: "Jobs" };

/** The screen reads ?filter= from the URL, so it sits under a Suspense boundary for static rendering. */
export default function JobsPage() {
  return (
    <Suspense fallback={<JobsScreenSkeleton />}>
      <JobsScreen />
    </Suspense>
  );
}
