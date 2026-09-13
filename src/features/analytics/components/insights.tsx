import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function Insights({ items }: { items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights</CardTitle>
        <CardDescription>Worked out from your own shifts and bookings</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {items.length === 0 ? (
          <EmptyState compact icon={Lightbulb} title="Not enough history yet" description="Complete a few shifts and patterns about posting lead time, attendance and roles show up here." />
        ) : (
          <ul className="flex flex-col gap-4">
            {items.map((text) => (
              <li key={text} className="flex items-start gap-3 text-sm leading-6 text-fg">
                <span className="mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-900"><Lightbulb className="size-3.5" aria-hidden /></span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
