"use client";

import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart";
import { EmptyState } from "@/components/ui/empty-state";
import { pluralize } from "@/lib/utils";
import type { CategorySlice } from "./use-platform-analytics";

/** Ten short labels never fit a phone, so the chart scrolls sideways inside its own card. */
export function CategoryChart({ slices }: { slices: CategorySlice[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Events by category</CardTitle>
        <CardDescription>Published events only, biggest category first</CardDescription>
      </CardHeader>
      {slices.length === 0 ? (
        <EmptyState
          compact
          icon={BarChart3}
          title="Nothing published yet"
          description="Approve an event in the review queue and the category mix starts here."
        />
      ) : (
        <CardContent className="px-0 pb-5 pt-0">
          {/* The scroller clips vertically too, so the top padding keeps the hover tooltip visible. */}
          <div className="scrollbar-none overflow-x-auto px-5 pt-9">
            <div className="min-w-[600px]">
              <BarChart
                data={slices.map((s) => ({ label: s.label, value: s.count, hint: s.label }))}
                format={(v) => pluralize(v, "event")}
                height={180}
                ariaLabel="Published events per category"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
