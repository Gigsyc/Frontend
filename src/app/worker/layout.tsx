import type { Metadata } from "next";
import { WorkerShell } from "@/components/layout/worker-shell";

export const metadata: Metadata = { title: "GigSyc for Workers" };

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return <WorkerShell>{children}</WorkerShell>;
}
