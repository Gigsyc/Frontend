"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, Lock, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { VERIFICATION_LABELS } from "@/components/ui/verified";
import type { VerificationKey, Worker } from "@/types";
import { AddRefereeDialog } from "./add-referee-dialog";

const ORDER: VerificationKey[] = ["identity", "phone", "photo", "references", "skills"];

function CompleteAction({ check: k, onAddReferee }: { check: VerificationKey; onAddReferee: () => void }) {
  if (k === "references") return <Button size="sm" variant="outline" onClick={onAddReferee}>Complete</Button>;
  if (k === "skills") return <Button size="sm" variant="outline" asChild><Link href="/worker/onboarding?step=skills">Complete</Link></Button>;
  if (k === "phone") return <Button size="sm" variant="outline" onClick={() => toast.info("We'd text you a 6-digit code", { description: "Phone confirmation isn't wired up in the prototype." })}>Complete</Button>;
  return <Button size="sm" variant="outline" asChild><Link href="/worker/onboarding?step=verify">Complete</Link></Button>;
}

export function VerificationTab({ worker }: { worker: Worker }) {
  const [refereeOpen, setRefereeOpen] = useState(false);
  const done = ORDER.filter((k) => worker.verifications[k]).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="px-4 sm:px-5">
          <div className="flex items-baseline justify-between gap-3">
            <CardTitle>Trust checks</CardTitle>
            <span className="text-sm font-medium tabular text-fg-muted"><span className="text-fg">{done}</span> of {ORDER.length} complete</span>
          </div>
          <Progress value={(done / ORDER.length) * 100} tone={done === ORDER.length ? "success" : "cyan"} label="Verification progress" className="mt-2" />
          <CardDescription className="mt-1">Fully verified workers appear first in employer searches and can be auto-confirmed by talent pools.</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-2 pt-3 sm:px-5">
          <ul className="divide-y divide-border">
            {ORDER.map((k) => {
              const ok = worker.verifications[k];
              const meta = VERIFICATION_LABELS[k];
              return (
                <li key={k} className="flex items-start gap-3 py-3">
                  {ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success-600" aria-hidden /> : <Circle className="mt-0.5 size-5 shrink-0 text-ink-300" aria-hidden />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-fg">{meta.label}</span>
                      {ok ? <Badge tone="success">Verified</Badge> : <Badge tone="outline">Not yet</Badge>}
                    </div>
                    <p className="mt-0.5 text-[13px] text-fg-muted">{meta.description}</p>
                  </div>
                  {!ok ? <CompleteAction check={k} onAddReferee={() => setRefereeOpen(true)} /> : null}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-800"><UserPlus className="size-4" aria-hidden /></span>
            <div>
              <h3 className="text-[15px] font-semibold">References</h3>
              <p className="mt-0.5 text-[13px] text-fg-muted">{worker.verifications.references ? "Already checked. A second referee from a different employer still helps for premium roles." : "One confirmed referee unlocks the References mark."}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="sm:shrink-0" onClick={() => setRefereeOpen(true)}><UserPlus /> Add a referee</Button>
        </div>
      </Card>

      <div className="flex items-start gap-3 rounded-lg bg-navy-50 p-4 text-[13px] leading-5 text-navy-900">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>Employers only ever see the marks. Your ID number, documents and referee contacts stay with GigSyc, encrypted, and are deleted 30 days after a check is complete.</p>
      </div>

      <AddRefereeDialog open={refereeOpen} onOpenChange={setRefereeOpen} />
    </div>
  );
}
