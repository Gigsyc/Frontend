import type { Metadata } from "next";
import { ShiftDetailScreen } from "@/features/shifts/components/worker";

export const metadata: Metadata = { title: "Shift details" };

export default async function WorkerShiftDetailPage({ params }: PageProps<"/worker/shifts/[id]">) {
  const { id } = await params;
  return <ShiftDetailScreen id={id} />;
}
