import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

/** Three sentences, each one read straight off the numbers above it. */
export function PlatformInsights({ items }: { items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights</CardTitle>
        <CardDescription>Read from the published calendar, not a forecast</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {items.length === 0 ? (
          <EmptyState
            compact
            icon={Lightbulb}
            title="Nothing to read yet"
            description="Publish a few events and the shape of the calendar shows up here."
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {items.map((text) => (
              <li key={text} className="flex items-start gap-3 text-sm leading-6 text-fg">
                <span className="mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-900">
                  <Lightbulb className="size-3.5" aria-hidden />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
