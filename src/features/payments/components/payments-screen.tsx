"use client";

import { addDays, differenceInCalendarDays, parseISO } from "date-fns";
import { Percent, ReceiptText, Wallet } from "lucide-react";
import { ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { SERVICE_FEE_RATE } from "@/data/roles";
import { useEmployer } from "@/features/employers";
import { useEmployerSession } from "@/features/session";
import { formatRwf, pluralize } from "@/lib/utils";
import { useEmployerInvoices } from "../queries";
import { BillingExplainer } from "./billing-explainer";
import { InvoiceTable } from "./invoice-table";
import { PaymentMethodCard } from "./payment-method-card";
import { PaymentsSkeleton } from "./payments-skeleton";

export function PaymentsScreen() {
  const { employerId } = useEmployerSession();
  const { data: invoices, isPending, isError, error, refetch, isRefetching } = useEmployerInvoices(employerId);
  const { data: employer } = useEmployer(employerId);

  const now = new Date();
  const sorted = invoices ? [...invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)) : [];
  const due = sorted.filter((i) => i.status === "due" || i.status === "overdue");
  const outstanding = due.reduce((a, i) => a + i.total, 0);
  const paidRecent = sorted.filter((i) => i.status === "paid" && i.paidAt && differenceInCalendarDays(now, parseISO(i.paidAt)) <= 30);
  const paidLast30 = paidRecent.reduce((a, i) => a + i.total, 0);
  const latestIssued = sorted[0]?.issuedAt;
  const nextInvoiceDays = latestIssued ? Math.max(0, differenceInCalendarDays(addDays(parseISO(latestIssued), 14), now)) : 14;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description={invoices ? `Billing: fortnightly · Next invoice in ${pluralize(nextInvoiceDays, "day")}` : "Billing: fortnightly"}
      />

      {isPending ? (
        <PaymentsSkeleton />
      ) : isError ? (
        <div className="rounded-lg bg-surface shadow-card">
          <ErrorState title="We couldn't load your invoices" error={error} onRetry={() => void refetch()} retrying={isRefetching} />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Outstanding" value={formatRwf(outstanding, { compact: true })} icon={ReceiptText} hint={due.length ? `${pluralize(due.length, "invoice")} due` : "Nothing due right now"} />
            <Stat label="Paid last 30 days" value={formatRwf(paidLast30, { compact: true })} icon={Wallet} hint={paidRecent.length ? `${pluralize(paidRecent.length, "invoice")} settled` : "No payments in the last 30 days"} />
            <Stat label="Service fee rate" value={`${Math.round(SERVICE_FEE_RATE * 100)}%`} icon={Percent} hint="Added to worker pay on every invoice" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <InvoiceTable invoices={sorted} />
            <div className="flex flex-col gap-6">
              <PaymentMethodCard phone={employer?.contact.phone} />
              <BillingExplainer />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
