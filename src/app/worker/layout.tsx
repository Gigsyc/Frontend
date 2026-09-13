import type { Metadata } from "next";
import { WorkerShell } from "@/components/layout/worker-shell";
import { RequireAuth } from "@/features/auth";

export const metadata: Metadata = { title: "GigSyc for Workers" };

/**
 * Shifts, earnings and payouts are one person's own record, so the worker app is
 * signed-in only. `RequireAuth` rather than `RequireRole` keeps the shell's "Switch to
 * business view" working for anyone already signed in.
 */
export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <WorkerShell>{children}</WorkerShell>
    </RequireAuth>
  );
}
