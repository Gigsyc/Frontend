import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/admin-shell";
import { RequireRole } from "@/features/auth";

export const metadata: Metadata = { title: "GigSyc Operations" };

/**
 * The operations console moderates events, suspends accounts and reads every report, so
 * it is the one surface that checks the role and not just the session — this is the
 * `RequireRole` usage `features/auth/guards.tsx` describes. Anyone signed in as another
 * role is sent to their own home rather than shown the console.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["admin"]}>
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}
