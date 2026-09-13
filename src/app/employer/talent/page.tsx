import type { Metadata } from "next";
import { Suspense } from "react";
import { TalentScreen, TalentScreenSkeleton } from "@/features/talent-pool/components/talent-screen";

export const metadata: Metadata = { title: "Talent" };

export default function TalentPage() {
  return (
    <Suspense fallback={<TalentScreenSkeleton />}>
      <TalentScreen />
    </Suspense>
  );
}
