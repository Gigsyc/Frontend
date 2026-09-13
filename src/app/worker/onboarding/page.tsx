import type { Metadata } from "next";
import { Suspense } from "react";
import { OnboardingScreen, OnboardingSkeleton } from "@/features/onboarding";

export const metadata: Metadata = { title: "Set up your profile" };

/** The wizard reads `?step=` from the URL, so it sits under a Suspense boundary for static rendering. */
export default function WorkerOnboardingPage() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingScreen />
    </Suspense>
  );
}
