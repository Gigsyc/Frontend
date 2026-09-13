import type { Metadata } from "next";
import { AdminSettingsScreen } from "@/features/admin/components/settings/settings-screen";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return <AdminSettingsScreen />;
}
