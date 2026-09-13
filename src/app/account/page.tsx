import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountRoute, AccountSkeleton } from "@/features/account";

export const metadata: Metadata = {
  title: "Your account",
  description: "Your GigSyc profile, interests, saved events and account settings.",
};

/**
 * The tab lives in `?tab=`, so the screen sits under a Suspense boundary like /events does.
 * `<AccountRoute>` carries the same skeleton through the session read, so the prerender and
 * the client hand over without a second loading treatment in between.
 */
export default function AccountPage() {
  return (
    <Suspense fallback={<AccountSkeleton />}>
      <AccountRoute />
    </Suspense>
  );
}
