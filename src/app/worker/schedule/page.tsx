import type { Metadata } from "next";
import { ScheduleScreen } from "@/features/schedule";

export const metadata: Metadata = { title: "Your shifts" };

export default function WorkerSchedulePage() {
  return <ScheduleScreen />;
}
