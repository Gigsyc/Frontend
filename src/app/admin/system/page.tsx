import type { Metadata } from "next";
import { SystemScreen } from "@/features/admin/components/system/system-screen";

export const metadata: Metadata = { title: "System" };

export default function AdminSystemPage() {
  return <SystemScreen />;
}
