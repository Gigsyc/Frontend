"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InvoiceStatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatRwf, pluralize } from "@/lib/utils";
import type { Invoice } from "@/types";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const stagger = (i: number) => ({ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: EASE, delay: Math.min(i, 7) * 0.03 } });
const workersOn = (inv: Invoice) => inv.lines.reduce((a, l) => a + l.workers, 0);
const isDue = (inv: Invoice) => inv.status === "due" || inv.status === "overdue";

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>{invoices.length ? `${pluralize(invoices.length, "invoice")} · worker pay plus the 18% service fee` : "Issued every fortnight for completed shifts"}</CardDescription>
      </CardHeader>
      {invoices.length === 0 ? (
        <EmptyState compact icon={FileText} title="No invoices yet" description="Your first invoice is issued at the end of the fortnight in which a shift completes." />
      ) : (
        <>
          <div className="mt-3 hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-medium text-fg-muted">
                <tr className="border-b border-border [&>th]:px-5 [&>th]:pb-2">
                  <th scope="col">Invoice</th>
                  <th scope="col">Period</th>
                  <th scope="col" className="text-right">Shifts</th>
                  <th scope="col" className="text-right">Workers</th>
                  <th scope="col" className="text-right">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col">Due</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    {...stagger(i)}
                    onClick={() => router.push(`/employer/payments/${inv.id}`)}
                    className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-ink-50 [&>td]:px-5 [&>td]:py-3"
                  >
                    <td><Link href={`/employer/payments/${inv.id}`} className="font-medium text-fg hover:text-navy-800 tabular" onClick={(e) => e.stopPropagation()}>{inv.number}</Link></td>
                    <td className="text-fg-muted">{inv.periodLabel}</td>
                    <td className="text-right tabular">{inv.lines.length}</td>
                    <td className="text-right tabular">{workersOn(inv)}</td>
                    <td className="text-right font-semibold tabular">{formatRwf(inv.total)}</td>
                    <td><InvoiceStatusBadge status={inv.status} /></td>
                    <td className="whitespace-nowrap text-fg-muted">{formatDate(inv.dueAt)}</td>
                    <td className="text-right">
                      <Button variant={isDue(inv) ? "primary" : "ghost"} size="sm" asChild>
                        <Link href={`/employer/payments/${inv.id}`} onClick={(e) => e.stopPropagation()}>{isDue(inv) ? "Pay now" : "View"}</Link>
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-3 divide-y divide-border md:hidden">
            {invoices.map((inv, i) => (
              <motion.li key={inv.id} {...stagger(i)}>
                <Link href={`/employer/payments/${inv.id}`} className="flex min-h-[44px] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-ink-50">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-fg tabular">{inv.number}</span>
                      <InvoiceStatusBadge status={inv.status} />
                    </span>
                    <span className="mt-0.5 block text-[13px] text-fg-muted">{inv.periodLabel} · {pluralize(inv.lines.length, "shift")} · {workersOn(inv)} workers</span>
                    <span className="mt-0.5 block text-xs text-fg-subtle">{isDue(inv) ? `Due ${formatDate(inv.dueAt)}` : inv.paidAt ? `Paid ${formatDate(inv.paidAt)}` : formatDate(inv.dueAt)}</span>
                  </span>
                  <span className="font-display text-base font-semibold text-navy-900 tabular">{formatRwf(inv.total, { compact: true })}</span>
                  <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
                </Link>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
