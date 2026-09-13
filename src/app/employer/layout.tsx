import type { Metadata } from "next";
import { EmployerShell } from "@/components/layout/employer-shell";
import { RequireAuth } from "@/features/auth";

export const metadata: Metadata = { title: "GigSyc for Business" };

/**
 * The partner workspace holds one organisation's shifts, candidates and invoices, so it
 * is signed-in only — a signed-out deep link goes to /login?next= and comes back here.
 * The check is `RequireAuth`, not `RequireRole`, so the shell's "Switch to worker view"
 * keeps working for anyone already signed in.
 */
export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <EmployerShell>{children}</EmployerShell>
    </RequireAuth>
  );
}
