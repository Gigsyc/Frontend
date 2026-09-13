import type { Metadata } from "next";
import { PaymentsScreen } from "@/features/payments/components/payments-screen";

export const metadata: Metadata = { title: "Payments" };

export default function EmployerPaymentsPage() {
  return <PaymentsScreen />;
}
