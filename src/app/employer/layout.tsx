import type { Metadata } from "next";
import { EmployerShell } from "@/components/layout/employer-shell";

export const metadata: Metadata = { title: "GigSyc for Business" };

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return <EmployerShell>{children}</EmployerShell>;
}
