import { Check, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VERIFICATION_LABELS, isFullyVerified } from "@/components/ui/verified";
import { cn } from "@/lib/utils";
import type { VerificationKey, Worker } from "@/types";

/** The checks GigSyc runs, in the order they appear. Also the denominator for "verified" counts. */
export const VERIFICATION_ORDER: VerificationKey[] = ["identity", "phone", "photo", "references", "skills"];

export function WorkerVerificationTab({ worker }: { worker: Worker }) {
  const done = VERIFICATION_ORDER.filter((k) => worker.verifications[k]).length;
  const full = isFullyVerified(worker.verifications);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{full ? "Fully verified" : `${done} of ${VERIFICATION_ORDER.length} checks complete`}</CardTitle>
        <CardDescription>
          {full
            ? `Every check GigSyc runs has passed for ${worker.firstName}.`
            : `${worker.firstName} can take shifts now; the remaining checks complete as they work.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="divide-y divide-border">
          {VERIFICATION_ORDER.map((key) => {
            const ok = worker.verifications[key];
            const meta = VERIFICATION_LABELS[key];
            return (
              <li key={key} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className={cn("mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full", ok ? "bg-success-500 text-white" : "bg-ink-100 text-fg-muted")} aria-hidden>
                  {ok ? <Check className="size-3.5" strokeWidth={3} /> : <Clock className="size-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-fg">
                    {meta.label}
                    <span className={cn("text-xs font-medium", ok ? "text-success-700" : "text-fg-muted")}>{ok ? "Verified" : "Pending"}</span>
                  </p>
                  <p className="text-[13px] text-fg-muted">{meta.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-5 flex items-start gap-2 rounded-md bg-cyan-50 p-3 text-[13px] leading-5 text-cyan-800">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          GigSyc verified these documents. Employers never see ID numbers or copies of documents.
        </p>
      </CardContent>
    </Card>
  );
}
