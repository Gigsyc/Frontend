import type { Metadata } from "next";
import { Suspense } from "react";
import { ModerationScreen, ModerationScreenSkeleton } from "@/features/admin/components/moderation/moderation-screen";

export const metadata: Metadata = { title: "Moderation" };

/** The open/resolved/dismissed tab lives in the URL, so the screen sits under a Suspense boundary. */
export default function AdminModerationPage() {
  return (
    <Suspense fallback={<ModerationScreenSkeleton />}>
      <ModerationScreen />
    </Suspense>
  );
}
