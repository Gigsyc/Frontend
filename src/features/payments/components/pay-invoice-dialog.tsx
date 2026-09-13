"use client";

import { Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatRwf } from "@/lib/utils";
import type { Invoice } from "@/types";
import { usePayInvoice } from "../queries";

interface Props {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaid?: () => void;
}

export function PayInvoiceDialog({ invoice, open, onOpenChange, onPaid }: Props) {
  const pay = usePayInvoice();

  const confirm = () => {
    pay.mutate(invoice.id, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success(`Invoice ${invoice.number} paid`, { description: `${formatRwf(invoice.total)} sent via MTN MoMo Business. A receipt is on its way by email.` });
        onPaid?.();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !pay.isPending && onOpenChange(o)}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Pay {formatRwf(invoice.total)}?</DialogTitle>
          <DialogDescription>Invoice {invoice.number} · {invoice.periodLabel}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex items-start gap-3 rounded-md bg-ink-50 p-3 text-sm">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-surface text-navy-800 shadow-card"><Smartphone className="size-4" aria-hidden /></span>
            <span>
              <span className="block font-medium text-fg">MTN MoMo Business</span>
              <span className="block text-fg-muted">You&rsquo;ll get a push prompt on the registered line to approve. Nothing is charged in the prototype.</span>
            </span>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost" disabled={pay.isPending}>Cancel</Button></DialogClose>
          <Button onClick={confirm} loading={pay.isPending}>Confirm payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
