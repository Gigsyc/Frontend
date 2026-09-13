import { MapPinned } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DistributionBar } from "@/components/ui/chart";
import { EmptyState } from "@/components/ui/empty-state";
import type { PlaceSlice } from "./use-platform-analytics";

const PALETTE = ["bg-navy-900", "bg-navy-500", "bg-cyan-500", "bg-navy-200", "bg-ink-400", "bg-cyan-200", "bg-navy-700", "bg-ink-300"];

export function PlaceMix({ slices }: { slices: PlaceSlice[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Events by place</CardTitle>
        <CardDescription>Where the published calendar actually happens</CardDescription>
      </CardHeader>
      {slices.length === 0 ? (
        <EmptyState
          compact
          icon={MapPinned}
          title="No places to compare"
          description="Once events are published the split across the eight places shows here."
        />
      ) : (
        <CardContent className="pt-4">
          <DistributionBar
            segments={slices.map((s, i) => ({ label: s.place, value: s.count, className: PALETTE[i % PALETTE.length] }))}
          />
        </CardContent>
      )}
    </Card>
  );
}
