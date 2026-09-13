"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { InvoiceStatusBadge, INVOICE_STATUS } from "@/components/ui/status-badge";
import { formatDate, formatRwf, pluralize } from "@/lib/utils";
import { useInvoice } from "../queries";
import { InvoiceLines } from "./invoice-lines";
import { PayInvoiceDialog } from "./pay-invoice-dialog";
import { InvoiceDetailSkeleton } from "./payments-skeleton";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function InvoiceDetailScreen({ id }: { id: string }) {
  const { data: invoice, isPending, isError, error, refetch, isRefetching } = useInvoice(id);
  const [payOpen, setPayOpen] = useState(false);
  const [justPaid, setJustPaid] = useState(false);
  const payable = invoice?.status === "due" || invoice?.status === "overdue";

  const download = () => toast("PDF download is not part of the prototype.", { description: "In the product this is a signed PDF you can forward to finance." });

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/employer/payments"
        backLabel="Payments"
        eyebrow="Invoice"
        title={invoice ? <span className="tabular">{invoice.number}</span> : "Invoice"}
        description={invoice ? `${invoice.periodLabel} · Issued ${formatDate(invoice.issuedAt)} · Due ${formatDate(invoice.dueAt)}` : undefined}
        actions={invoice ? (
          <>
            <Button variant="outline" onClick={download}><Download /> Download PDF</Button>
            {payable ? <Button onClick={() => setPayOpen(true)}>Pay {formatRwf(invoice.total, { compact: true })}</Button> : null}
          </>
        ) : null}
      />

      {isPending ? (
        <InvoiceDetailSkeleton />
      ) : isError || !invoice ? (
        <div className="rounded-lg bg-surface shadow-card">
          <ErrorState title="We couldn't open this invoice" error={error} onRetry={() => void refetch()} retrying={isRefetching} />
          <div className="flex justify-center pb-8"><Button variant="link" asChild><Link href="/employer/payments">Back to payments</Link></Button></div>
        </div>
      ) : (
        <>
          <AnimatePresence>
            {justPaid && invoice.status === "paid" ? (
              <motion.p
                role="status"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="flex items-center gap-2.5 rounded-lg bg-success-50 px-5 py-3.5 text-sm font-medium text-success-700"
              >
                <CheckCircle2 className="size-4" aria-hidden /> Paid {invoice.paidAt ? `on ${formatDate(invoice.paidAt)}` : "just now"}. Thanks — your posting limit is unchanged.
              </motion.p>
            ) : null}
          </AnimatePresence>

          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <InvoiceLines invoice={invoice} />
            <Card className="self-start">
              <CardContent className="flex flex-col gap-5">
                <div>
                  <p className="text-[13px] font-medium text-fg-muted">Total</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <span className="font-display text-[28px] font-semibold leading-none tracking-tight text-navy-900 tabular">{formatRwf(invoice.total)}</span>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </div>
                <DataList
                  items={[
                    { label: "Status", value: INVOICE_STATUS[invoice.status].label },
                    { label: "Shifts", value: pluralize(invoice.lines.length, "shift") },
                    { label: "Issued", value: formatDate(invoice.issuedAt) },
                    { label: "Due", value: formatDate(invoice.dueAt) },
                    { label: "Paid on", value: invoice.paidAt ? formatDate(invoice.paidAt) : "—" },
                    { label: "Payment method", value: "MTN MoMo Business" },
                  ]}
                  columns={2}
                />
                {payable ? <Button size="lg" className="w-full" onClick={() => setPayOpen(true)}>Pay now</Button> : null}
              </CardContent>
            </Card>
          </div>

          <PayInvoiceDialog invoice={invoice} open={payOpen} onOpenChange={setPayOpen} onPaid={() => setJustPaid(true)} />
        </>
      )}
    </div>
  );
}
