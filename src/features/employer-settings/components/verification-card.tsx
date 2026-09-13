import { Building2, CheckCircle2, Circle, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployerVerifiedMark } from "@/components/ui/verified";
import { formatDate } from "@/lib/utils";
import type { Employer } from "@/types";

export function VerificationCard({ employer }: { employer: Employer }) {
  const checks = [
    { icon: Building2, label: "Business registration", detail: employer.verified ? "RDB certificate matched to the organisation name" : "Upload your RDB certificate", done: employer.verified },
    { icon: Phone, label: "Contact confirmed", detail: `${employer.contact.phone} · one-time code`, done: true },
    { icon: MapPin, label: "Address checked", detail: `${employer.district}, Kigali`, done: employer.verified },
  ];
  const doneCount = checks.filter((c) => c.done).length;

  return (
    <Card className="self-start">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Verification</CardTitle>
          {employer.verified ? <EmployerVerifiedMark /> : null}
        </div>
        <CardDescription>
          {employer.verified
            ? `Verified since ${formatDate(employer.memberSince)}. Workers see the mark on every posting.`
            : `${doneCount} of ${checks.length} checks done. Verified employers fill shifts faster.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="flex flex-col gap-3">
          {checks.map(({ icon: Icon, label, detail, done }) => (
            <li key={label} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-800"><Icon className="size-4" aria-hidden /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-fg">{label}</span>
                <span className="block text-[13px] text-fg-muted">{detail}</span>
              </span>
              {done
                ? <CheckCircle2 className="mt-1 size-4 shrink-0 text-success-600" aria-label="Done" />
                : <Circle className="mt-1 size-4 shrink-0 text-ink-300" aria-label="Not done" />}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
