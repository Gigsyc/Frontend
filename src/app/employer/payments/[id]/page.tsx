import type { Metadata } from "next";
import { InvoiceDetailScreen } from "@/features/payments/components/invoice-detail-screen";

export const metadata: Metadata = { title: "Invoice" };

export default async function InvoicePage({ params }: PageProps<"/employer/payments/[id]">) {
  const { id } = await params;
  return <InvoiceDetailScreen id={id} />;
}
