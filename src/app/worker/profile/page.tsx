import type { Metadata } from "next";
import { ProfileScreen } from "@/features/profile";

export const metadata: Metadata = { title: "My profile" };

export default function WorkerProfilePage() {
  return <ProfileScreen />;
}
