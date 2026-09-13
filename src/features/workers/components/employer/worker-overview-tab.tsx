import { Award, Check, GraduationCap, X } from "lucide-react";
import { RoleIcon } from "@/components/common/role-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLES } from "@/data/roles";
import { cn, formatRwf } from "@/lib/utils";
import type { Worker } from "@/types";

const AVAILABILITY: Array<{ key: keyof Worker["availability"]; label: string; hint: string }> = [
  { key: "weekdays", label: "Weekdays", hint: "Mon–Fri daytime" },
  { key: "weekends", label: "Weekends", hint: "Sat & Sun" },
  { key: "evenings", label: "Evenings", hint: "After 17:00" },
  { key: "overnight", label: "Overnight", hint: "Past midnight" },
];

export function WorkerOverviewTab({ worker }: { worker: Worker }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>About {worker.firstName}</CardTitle></CardHeader>
        <CardContent className="pt-3">
          <p className="text-sm leading-6 text-fg">{worker.bio}</p>
          {worker.minShiftPay ? (
            <p className="mt-4 text-[13px] text-fg-muted">
              Typically accepts shifts from <span className="tabular font-semibold text-fg">{formatRwf(worker.minShiftPay)}</span> per shift.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
        <CardContent className="pt-3">
          <ul className="grid gap-3 sm:grid-cols-2">
            {worker.skills.map((skill, i) => (
              <li key={skill} className="flex items-center gap-3">
                <RoleIcon role={skill} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-fg">
                    {ROLES[skill].label}
                    {i === 0 ? <Badge tone="navy">Primary</Badge> : null}
                  </p>
                  <p className="truncate text-xs text-fg-muted">{ROLES[skill].description}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Certifications & education</CardTitle></CardHeader>
          <CardContent className="pt-3">
            {worker.certifications.length === 0 && !worker.education ? (
              <p className="text-sm text-fg-muted">None listed yet.</p>
            ) : (
              <ul className="space-y-2.5 text-sm">
                {worker.certifications.map((c) => (
                  <li key={c} className="flex items-start gap-2.5"><Award className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />{c}</li>
                ))}
                {worker.education ? (
                  <li className="flex items-start gap-2.5"><GraduationCap className="mt-0.5 size-4 shrink-0 text-navy-700" aria-hidden />{worker.education}</li>
                ) : null}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
          <CardContent className="pt-3">
            <ul className="grid grid-cols-2 gap-2">
              {AVAILABILITY.map((a) => {
                const yes = worker.availability[a.key];
                return (
                  <li key={a.key} className={cn("flex items-center gap-2.5 rounded-md border p-2.5", yes ? "border-success-500/30 bg-success-50/50" : "border-border bg-ink-50")}>
                    <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-full", yes ? "bg-success-500 text-white" : "bg-ink-200 text-ink-600")}>
                      {yes ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <X className="size-3.5" strokeWidth={3} aria-hidden />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-fg">{a.label}</span>
                      <span className="block text-xs text-fg-muted">{yes ? a.hint : "Not available"}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
