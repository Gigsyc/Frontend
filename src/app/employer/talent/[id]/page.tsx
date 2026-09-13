import type { Metadata } from "next";
import { WorkerProfileScreen } from "@/features/workers/components/employer/worker-profile-screen";

export const metadata: Metadata = { title: "Worker profile" };

export default async function WorkerProfilePage({ params }: PageProps<"/employer/talent/[id]">) {
  const { id } = await params;
  return <WorkerProfileScreen id={id} />;
}
