import type { Metadata } from "next";
import { DestinationsScreen } from "@/features/admin/components/destinations/destinations-screen";

export const metadata: Metadata = { title: "Destinations" };

export default function AdminDestinationsPage() {
  return <DestinationsScreen />;
}
