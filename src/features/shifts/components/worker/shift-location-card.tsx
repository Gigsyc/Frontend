import { ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Shift } from "@/types";

/** Venue + address with a hand-off to Google Maps. No embedded map in the prototype. */
export function ShiftLocationCard({ shift }: { shift: Pick<Shift, "venue" | "address" | "district"> }) {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${shift.venue}, ${shift.address}, Kigali`)}`;
  return (
    <Card className="flex items-start gap-3 p-4 sm:p-5">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-800">
        <MapPin className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold">{shift.venue}</h2>
        <p className="mt-0.5 text-sm text-fg-muted">{shift.address} · {shift.district}, Kigali</p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps <ExternalLink aria-hidden /></a>
        </Button>
      </div>
    </Card>
  );
}
