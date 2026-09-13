"use client";

import { useState } from "react";
import { Landmark, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Method = "momo" | "bank";

const METHODS: Record<Method, { label: string; icon: typeof Smartphone; detail: (phone?: string) => string; note: string }> = {
  momo: {
    label: "MTN MoMo Business",
    icon: Smartphone,
    detail: (phone) => `Merchant line ending ${phone?.replace(/\s/g, "").slice(-3) ?? "214"}`,
    note: "Approve the push prompt on the registered line. Settles instantly.",
  },
  bank: {
    label: "Bank transfer",
    icon: Landmark,
    detail: () => "Bank of Kigali · account ending 4471",
    note: "Use the invoice number as the reference. Clears in 1–2 working days.",
  },
};

export function PaymentMethodCard({ phone }: { phone?: string }) {
  const [method, setMethod] = useState<Method>("momo");
  const [draft, setDraft] = useState<Method>(method);
  const [open, setOpen] = useState(false);
  const current = METHODS[method];
  const Icon = current.icon;

  const save = () => {
    setMethod(draft);
    setOpen(false);
    toast.success(`Paying by ${METHODS[draft].label}`, { description: "Prototype only — no billing details are stored." });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Payment method</CardTitle>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(method); }}>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Change</Button>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>How do you want to pay invoices?</DialogTitle>
              <DialogDescription>Applies to the next invoice onwards.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <fieldset className="flex flex-col gap-2">
                <legend className="sr-only">Payment method</legend>
                {(Object.keys(METHODS) as Method[]).map((key) => {
                  const m = METHODS[key];
                  const MIcon = m.icon;
                  return (
                    <label key={key} className={cn("flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors", draft === key ? "border-navy-900 bg-navy-50/50" : "border-border hover:border-ink-400")}>
                      <input type="radio" name="payment-method" value={key} checked={draft === key} onChange={() => setDraft(key)} className="mt-1 accent-navy-900" />
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-800"><MIcon className="size-4" aria-hidden /></span>
                      <span className="flex flex-col gap-0.5 text-sm">
                        <span className="font-medium text-fg">{m.label}</span>
                        <span className="text-fg-muted">{m.detail(phone)}</span>
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
              <Button onClick={save}>Save method</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex items-start gap-3 pt-4">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-800"><Icon className="size-5" aria-hidden /></span>
        <div className="min-w-0 text-sm">
          <p className="font-medium text-fg">{current.label}</p>
          <p className="text-fg-muted">{current.detail(phone)}</p>
          <p className="mt-1.5 text-xs leading-5 text-fg-subtle">{current.note}</p>
        </div>
      </CardContent>
    </Card>
  );
}
