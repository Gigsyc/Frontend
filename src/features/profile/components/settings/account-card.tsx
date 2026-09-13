"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Worker } from "@/types";

/** Contact details are read-only in the prototype: changing a phone or email would need an OTP flow. */
function Row({ label, value, onChange, changeLabel }: { label: string; value: string; onChange: () => void; changeLabel: string }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <dt className="text-xs font-medium text-fg-muted">{label}</dt>
        <dd className="truncate text-sm text-fg tabular">{value}</dd>
      </div>
      <Button variant="ghost" size="sm" onClick={onChange} aria-label={changeLabel}>Change</Button>
    </div>
  );
}

export function AccountCard({ worker }: { worker: Worker }) {
  const email = `${worker.firstName}.${worker.lastName}@gmail.com`.toLowerCase().replace(/\s+/g, "");
  const notWired = (what: string, how: string) => toast.info(`Changing your ${what} isn't in the prototype`, { description: how });

  return (
    <Card>
      <CardHeader className="px-4 sm:px-5">
        <CardTitle>Account</CardTitle>
        <CardDescription>The name on your ID is what employers and payouts use.</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pt-3 sm:px-5">
        <dl className="divide-y divide-border">
          <Row label="Full name" value={`${worker.firstName} ${worker.lastName}`} changeLabel="Change name" onChange={() => notWired("name", "In the real product this reopens ID verification, since the name has to match your National ID.")} />
          <Row label="Mobile number" value="+250 788 ••• ••4" changeLabel="Change mobile number" onChange={() => notWired("number", "We'd text a 6-digit code to the new number before switching payouts to it.")} />
          <Row label="Email" value={email} changeLabel="Change email" onChange={() => notWired("email", "We'd send a confirmation link to the new address.")} />
        </dl>
      </CardContent>
    </Card>
  );
}
