"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PayoutMethod } from "@/types";
import { normaliseRwMobile, RW_MOBILE_RE } from "@/lib/utils";
import { BANKS, PAYOUT_METHODS } from "../../lib/settings-options";

interface PayoutForm { method: PayoutMethod; number: string; bank: string }

const PREFIX: Record<Exclude<PayoutMethod, "Bank transfer">, RegExp> = { "MTN MoMo": /^7[89]/, "Airtel Money": /^7[23]/ };

function validate(f: PayoutForm): string | undefined {
  if (f.method === "Bank transfer") {
    if (!/^\d{8,16}$/.test(f.number.replace(/\s/g, ""))) return "Enter your account number (8–16 digits).";
    return undefined;
  }
  const n = normaliseRwMobile(f.number);
  if (!RW_MOBILE_RE.test(n)) return "Enter a Rwandan mobile number, e.g. 788 123 456.";
  if (!PREFIX[f.method].test(n)) return f.method === "MTN MoMo" ? "MTN numbers start with 078 or 079." : "Airtel numbers start with 072 or 073.";
  return undefined;
}

/** Local state only: the prototype's Payout type has no per-worker payout profile, so nothing is written to the store. */
export function PayoutCard() {
  const [form, setForm] = useState<PayoutForm>({ method: "MTN MoMo", number: "788 234 564", bank: BANKS[0] });
  const [attempted, setAttempted] = useState(false);
  const [pending, setPending] = useState(false);
  const error = attempted ? validate(form) : undefined;
  const meta = PAYOUT_METHODS.find((m) => m.value === form.method)!;
  const isBank = form.method === "Bank transfer";

  const save = (ev: React.FormEvent) => {
    ev.preventDefault();
    setAttempted(true);
    if (validate(form)) return;
    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      setAttempted(false);
      const target = isBank ? `${form.bank} ····${form.number.replace(/\s/g, "").slice(-4)}` : `${form.method} ····${normaliseRwMobile(form.number).slice(-3)}`;
      toast.success("Payout method saved", { description: `Your next payout goes to ${target}.` });
    }, 500);
  };

  return (
    <Card>
      <form onSubmit={save} noValidate>
        <CardHeader className="px-4 sm:px-5">
          <CardTitle>Payout method</CardTitle>
          <CardDescription>Where your pay lands after an employer approves a shift.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-4 pt-4 sm:px-5">
          <fieldset>
            <legend className="sr-only">Payout method</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {PAYOUT_METHODS.map((m) => {
                const selected = form.method === m.value;
                return (
                  <label key={m.value} className={cn("flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors", selected ? "border-navy-900 bg-navy-50/60" : "border-border-strong hover:border-ink-400")}>
                    <input type="radio" name="payout-method" value={m.value} checked={selected} onChange={() => setForm((f) => ({ ...f, method: m.value, number: m.value === f.method ? f.number : "" }))} className="mt-1 size-4 accent-navy-900" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-fg">{m.label}</span>
                      <span className="block text-xs text-fg-muted">{m.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          {isBank ? (
            <Field label="Bank" required>
              {(p) => (
                <Select {...p} value={form.bank} onChange={(e) => setForm((f) => ({ ...f, bank: e.target.value }))}>
                  {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </Select>
              )}
            </Field>
          ) : null}
          <Field label={meta.numberLabel} required error={error} hint={isBank ? "Account must be in your name." : "Must be registered in your name — MoMo checks this on the first payout."}>
            {(p) => (
              <Input
                {...p}
                type="tel"
                inputMode="numeric"
                value={form.number}
                onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                placeholder={meta.placeholder}
                leading={isBank ? undefined : <span className="text-[13px] font-medium">+250</span>}
                className={cn(!isBank && "pl-14")}
              />
            )}
          </Field>
        </CardContent>
        <CardFooter className="justify-end px-4 sm:px-5">
          <Button type="submit" loading={pending}>Save payout method</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
