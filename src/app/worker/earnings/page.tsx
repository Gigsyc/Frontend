import type { Metadata } from "next";
import { EarningsScreen } from "@/features/earnings";

export const metadata: Metadata = { title: "Earnings" };

export default function WorkerEarningsPage() {
  return <EarningsScreen />;
}
