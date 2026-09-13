"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SwitchField } from "@/components/ui/checkbox";

type PrefKey = "applications" | "checkIns" | "noShows" | "invoices";

const PREFS: Array<{ key: PrefKey; label: string; description: string }> = [
  { key: "applications", label: "New applications", description: "When a worker applies to one of your open shifts. Grouped, at most once an hour." },
  { key: "checkIns", label: "Check-ins", description: "A summary when a shift starts: who has checked in and who hasn't." },
  { key: "noShows", label: "No-shows", description: "Straight away if a confirmed worker is 20 minutes late, so you can invite cover." },
  { key: "invoices", label: "Invoices", description: "When a fortnightly invoice is issued, three days before it's due, and when it's paid." },
];

export function NotificationsTab() {
  // Local state only: the prototype has no per-user preference store.
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({ applications: true, checkIns: true, noShows: true, invoices: true });
  const onCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>What we tell you about</CardTitle>
          <CardDescription>Sent by email to your main contact and shown in the bell in the top bar. Changes apply immediately.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="divide-y divide-border">
            {PREFS.map((p) => (
              <li key={p.key} className="py-4 first:pt-0 last:pb-0">
                <SwitchField
                  label={p.label}
                  description={p.description}
                  checked={prefs[p.key]}
                  onCheckedChange={(v) => setPrefs((prev) => ({ ...prev, [p.key]: v }))}
                  className="min-h-[44px]"
                />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="self-start">
        <CardContent className="text-sm">
          <p className="font-medium text-fg">{onCount === PREFS.length ? "You\u2019re getting everything." : onCount === 0 ? "All alerts are off." : `${onCount} of ${PREFS.length} alerts on.`}</p>
          <p className="mt-1.5 leading-6 text-fg-muted">
            No-show alerts are the one we&rsquo;d keep on: a replacement invited within the first 30 minutes usually still makes the shift.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
