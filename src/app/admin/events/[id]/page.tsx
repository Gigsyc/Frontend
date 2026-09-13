import type { Metadata } from "next";
import { AdminEventScreen } from "@/features/admin/components/events";

export const metadata: Metadata = { title: "Event record" };

export default async function AdminEventPage({ params }: PageProps<"/admin/events/[id]">) {
  const { id } = await params;
  return <AdminEventScreen id={id} />;
}
