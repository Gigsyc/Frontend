import type { Metadata } from "next";
import { SettingsScreen } from "@/features/employer-settings";

export const metadata: Metadata = { title: "Settings" };

export default function EmployerSettingsPage() {
  return <SettingsScreen />;
}
