import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SERVICE_FEE_RATE } from "@/data/roles";
import { formatRwf, pluralize } from "@/lib/utils";
import type { Invoice } from "@/types";

export function InvoiceLines({ invoice }: { invoice: Invoice }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shifts on this invoice</CardTitle>
        <CardDescription>{pluralize(invoice.lines.length, "shift")} · worker pay is the flat rate per shift times workers who completed</CardDescription>
      </CardHeader>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs font-medium text-fg-muted">
            <tr className="border-b border-border [&>th]:px-5 [&>th]:pb-2">
              <th scope="col">Shift</th>
              <th scope="col" className="text-right">Workers</th>
              <th scope="col" className="text-right">Worker pay</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={`${line.shiftId}-${line.description}`} className="border-b border-border [&>td]:px-5 [&>td]:py-3">
                <td><Link href={`/employer/jobs/${line.shiftId}`} className="font-medium text-fg hover:text-navy-800">{line.description}</Link></td>
                <td className="text-right tabular">{line.workers}</td>
                <td className="text-right tabular">{formatRwf(line.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="[&_td]:px-5 [&_td]:py-2 [&_tr:first-child_td]:pt-4">
            <tr><td colSpan={2} className="text-right text-fg-muted">Subtotal</td><td className="text-right tabular">{formatRwf(invoice.subtotal)}</td></tr>
            <tr><td colSpan={2} className="text-right text-fg-muted">Service fee ({Math.round(SERVICE_FEE_RATE * 100)}%)</td><td className="text-right tabular">{formatRwf(invoice.serviceFee)}</td></tr>
            <tr className="border-t border-border [&>td]:pb-5 [&>td]:pt-3">
              <td colSpan={2} className="text-right font-semibold text-fg">Total</td>
              <td className="text-right font-display text-base font-semibold text-navy-900 tabular">{formatRwf(invoice.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
