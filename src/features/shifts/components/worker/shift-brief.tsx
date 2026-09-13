import { Check, Lock, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import type { Shift } from "@/types";

const CHECK_IN_COPY: Record<Shift["checkInMethod"], string> = {
  qr: "Scan the QR code at the staff entrance when you arrive. It appears in your schedule on the day; the supervisor confirms you're in.",
  supervisor: "Your supervisor checks you in on their phone when you arrive. Find them at the meeting point 15 minutes before start.",
  gps: "Open the shift in your schedule once you're at the venue — check-in unlocks when your phone is on site.",
};

interface ShiftBriefProps {
  shift: Shift;
  /** Supervisor phone is only shared with confirmed workers. */
  showPhone: boolean;
}

/** What you'll do, what you'll need, and the on-the-day logistics. */
export function ShiftBrief({ shift, showPhone }: ShiftBriefProps) {
  return (
    <Card className="space-y-6 p-4 sm:p-5">
      <section>
        <h2 className="text-base font-semibold">What you&apos;ll do</h2>
        <ul className="mt-3 space-y-2 text-sm leading-5 text-fg">
          {shift.responsibilities.map((r) => (
            <li key={r} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-success-600" strokeWidth={2.5} aria-hidden />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold">You&apos;ll need</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-5 text-fg marker:text-navy-400">
          {shift.requirements.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </section>

      <section className="border-t border-border pt-5">
        <h2 className="text-base font-semibold">On the day</h2>
        <DataList
          className="mt-3"
          items={[
            { label: "Dress code", value: shift.dressCode ?? "No specific dress code — smart, tidy and comfortable shoes." },
            { label: "How you check in", value: CHECK_IN_COPY[shift.checkInMethod] },
            {
              label: "Supervisor on the day",
              value: (
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">{shift.supervisor.name}</span>
                  {showPhone ? (
                    <a href={`tel:${shift.supervisor.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-1 text-navy-700 tabular underline-offset-4 hover:underline">
                      <Phone className="size-3.5" aria-hidden /> {shift.supervisor.phone}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-fg-muted"><Lock className="size-3.5" aria-hidden /> Phone shared once you&apos;re confirmed</span>
                  )}
                </span>
              ),
            },
          ]}
        />
      </section>
    </Card>
  );
}
