import type { Metadata } from "next";
import { PartnersScreen } from "@/features/admin/components/partners/partners-screen";

export const metadata: Metadata = { title: "Partners" };

export default function AdminPartnersPage() {
  return <PartnersScreen />;
}
