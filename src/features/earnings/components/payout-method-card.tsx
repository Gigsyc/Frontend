"use client";

import { useState } from "react";
import { Check, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PayoutMethod } from "@/types";
import type { PayoutMethodOption } from "../types";

/** Demo accounts on file. Prototype-only, kept in component state. */
const OPTIONS: PayoutMethodOption[] = [
  { method: "MTN MoMo", account: "078• ••• 214", hint: "Arrives within minutes once approved. No fee." },
  { method: "Airtel Money", account: "073• ••• 902", hint: "Arrives within minutes once approved. No fee." },
  { method: "Bank transfer", account: "Bank of Kigali · •••• 4471", hint: "1–2 working days. RWF 500 bank fee." },
];

export function PayoutMethodCard() {
  const [method, setMethod] = useState<PayoutMethod>("MTN MoMo");
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.method === method) ?? OPTIONS[0];

  return (
    <Card className="flex items-center gap-4 p-4 sm:p-5">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-800">
        <Smartphone className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-fg-muted">Payout method</p>
        <p className="truncate text-[15px] font-semibold text-fg">
          {current.method} <span className="font-normal text-fg-muted">·</span> <span className="font-mono text-sm tabular">{current.account}</span>
        </p>
      </div>
      <Button variant="outline" size="sm" className="min-h-11 sm:min-h-8" onClick={() => setOpen(true)}>Change</Button>
      <PayoutMethodDialog open={open} onOpenChange={setOpen} value={method} onSave={setMethod} />
    </Card>
  );
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: PayoutMethod;
  onSave: (m: PayoutMethod) => void;
}

function PayoutMethodDialog({ open, onOpenChange, value, onSave }: DialogProps) {
  const [draft, setDraft] = useState<PayoutMethod>(value);
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    // Local only in the prototype — a short beat so the button visibly commits.
    setTimeout(() => {
      onSave(draft);
      setSaving(false);
      onOpenChange(false);
      toast.success("Payout method updated", { description: `Future payouts go to ${draft}.` });
    }, 350);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (o) setDraft(value); onOpenChange(o); }}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Where should we pay you?</DialogTitle>
          <DialogDescription>Applies to payouts approved after you save. Money already processing keeps its method.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Payout method</legend>
            {OPTIONS.map((o) => {
              const selected = draft === o.method;
              return (
                <label
                  key={o.method}
                  className={cn(
                    "flex min-h-14 cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors",
                    selected ? "border-navy-900 bg-navy-50/60" : "border-border-strong hover:border-ink-400 hover:bg-ink-50",
                  )}
                >
                  <input type="radio" name="payout-method" value={o.method} checked={selected} onChange={() => setDraft(o.method)} className="sr-only" />
                  <span className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-navy-900 bg-navy-900 text-white" : "border-ink-300 bg-surface")} aria-hidden>
                    {selected ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-fg">{o.method} <span className="font-mono text-xs font-normal text-fg-muted tabular">{o.account}</span></span>
                    <span className="block text-xs text-fg-muted">{o.hint}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost" disabled={saving}>Cancel</Button></DialogClose>
          <Button onClick={save} loading={saving} disabled={draft === value}>Save method</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
