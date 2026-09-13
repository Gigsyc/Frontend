import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersScreen } from "@/features/admin/components/users/users-screen";
import { UsersScreenSkeleton } from "@/features/admin/components/users/users-skeleton";

export const metadata: Metadata = { title: "Users" };

/** The screen reads its filters from the URL, so it sits under a Suspense boundary. */
export default function AdminUsersPage() {
  return (
    <Suspense fallback={<UsersScreenSkeleton />}>
      <UsersScreen />
    </Suspense>
  );
}
