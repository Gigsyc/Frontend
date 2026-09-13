import type { Metadata } from "next";
import { SettingsScreen } from "@/features/profile";

export const metadata: Metadata = { title: "Settings" };

export default function WorkerSettingsPage() {
  return <SettingsScreen />;
}
