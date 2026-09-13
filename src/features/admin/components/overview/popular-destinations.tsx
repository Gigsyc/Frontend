"use client";

import { MapPinned } from "lucide-react";
import { EmptyState, Progress } from "@/components/ui";
import { pluralize } from "@/lib/utils";
import type { DestinationShare } from "../../hooks/use-admin-overview";
import { Panel, PanelLink } from "./panel";

/** Where published events actually are. The bar is relative to the busiest place, not to 100%. */
export function PopularDestinations({ items }: { items: DestinationShare[] }) {
  return (
    <Panel title="Popular destinations" action={<PanelLink href="/admin/destinations">Manage</PanelLink>}>
      {items.length === 0 ? (
        <EmptyState compact icon={MapPinned} title="No published events yet" description="Once events go live their places rank here." />
      ) : (
        <ul className="space-y-3.5 px-5 pb-5 pt-2">
          {items.map((d) => (
            <li key={d.place} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-fg">{d.place}</span>
                <span className="text-xs text-fg-muted tabular">{pluralize(d.count, "event")}</span>
              </div>
              <Progress value={d.share} tone="navy" label={`${pluralize(d.count, "published event")} in ${d.place}`} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
