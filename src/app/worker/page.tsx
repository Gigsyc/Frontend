import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverScreen, DiscoverScreenSkeleton } from "@/features/discover";

export const metadata: Metadata = { title: "Discover shifts" };

/** The screen reads filters from the URL, so it sits under a Suspense boundary for static rendering. */
export default function WorkerDiscoverPage() {
  return (
    <Suspense fallback={<DiscoverScreenSkeleton />}>
      <DiscoverScreen />
    </Suspense>
  );
}
