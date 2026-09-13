"use client";

import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SwitchField } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateWorker } from "@/features/workers";
import type { Worker } from "@/types";

type WindowKey = keyof Worker["availability"];

const WINDOWS: Array<{ key: WindowKey; label: string; description: string }> = [
  { key: "weekdays", label: "Weekdays", description: "Monday to Friday, daytime" },
  { key: "weekends", label: "Weekends", description: "Saturday and Sunday" },
  { key: "evenings", label: "Evenings", description: "Shifts that finish after 20:00" },
  { key: "overnight", label: "Overnight", description: "Shifts that run past midnight" },
];

/** Saves on every toggle. Shows the in-flight value optimistically from the mutation, so there's no local copy to keep in sync. */
export function AvailabilityCard({ worker }: { worker: Worker }) {
  const update = useUpdateWorker(worker.id);
  const shown = update.isPending && update.variables?.availability ? update.variables.availability : worker.availability;

  const toggle = (key: WindowKey, on: boolean) => {
    const next = { ...shown, [key]: on };
    const label = WINDOWS.find((w) => w.key === key)!.label;
    update.mutate({ availability: next }, {
      onSuccess: () => toast.success("Availability updated", { description: `${label}: ${on ? "available" : "not available"}. Matches update tonight.` }),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 px-4 sm:px-5">
        <div>
          <CardTitle>Availability</CardTitle>
          <CardDescription>We only send matches for the windows you switch on.</CardDescription>
        </div>
        {update.isPending ? <Spinner label="Saving availability" className="mt-1" /> : null}
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-3 sm:px-5">
        <ul className="divide-y divide-border">
          {WINDOWS.map((w) => (
            <li key={w.key} className="py-3">
              <SwitchField label={w.label} description={w.description} checked={shown[w.key]} onCheckedChange={(on) => toggle(w.key, on)} className="min-h-11" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
