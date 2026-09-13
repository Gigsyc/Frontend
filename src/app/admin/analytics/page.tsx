import type { Metadata } from "next";
import { AdminAnalyticsScreen } from "@/features/admin/components/analytics/analytics-screen";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return <AdminAnalyticsScreen />;
}
