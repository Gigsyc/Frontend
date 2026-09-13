import type { Metadata } from "next";
import { AdminOverviewScreen } from "@/features/admin/components/overview";

export const metadata: Metadata = { title: "Overview" };

export default function AdminOverviewPage() {
  return <AdminOverviewScreen />;
}
