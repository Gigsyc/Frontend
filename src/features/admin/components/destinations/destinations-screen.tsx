"use client";

import { useMemo, useState } from "react";
import { MapPinned } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useAdminDestinations, useAdminEvents, useUpdateDestination } from "@/features/admin";
import { errorMessage, pluralize } from "@/lib/utils";
import type { Destination } from "@/types";
import { DestinationsSkeleton } from "./destinations-skeleton";
import { DestinationsTable, type DestinationFlag } from "./destinations-table";
import { EditDestinationSheet } from "./edit-destination-sheet";

const FLAG_COPY: Record<DestinationFlag, (name: string, on: boolean) => string> = {
  featured: (name, on) => (on ? `${name} is now featured on the public site.` : `${name} is no longer featured.`),
  published: (name, on) => (on ? `${name} is back in “Browse by place”.` : `${name} is hidden from “Browse by place”.`),
};

/** /admin/destinations — the eight places, their copy, and whether the public site shows them. */
export function DestinationsScreen() {
  const destinations = useAdminDestinations();
  const events = useAdminEvents({});
  const update = useUpdateDestination();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [editing, setEditing] = useState<Destination | null>(null);

  const publishedEvents = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events.data ?? []) {
      if (e.status !== "published") continue;
      counts[e.place] = (counts[e.place] ?? 0) + 1;
    }
    return counts;
  }, [events.data]);

  const toggle = (destination: Destination, flag: DestinationFlag, value: boolean) => {
    const key = `${destination.id}:${flag}`;
    setPendingKey(key);
    update.mutate(
      { id: destination.id, patch: { [flag]: value } },
      {
        onSuccess: () => toast.success(FLAG_COPY[flag](destination.name, value)),
        onError: (err) => toast.error(errorMessage(err, "We couldn't save that. Try again.")),
        onSettled: () => setPendingKey((k) => (k === key ? null : k)),
      },
    );
  };

  const list = destinations.data ?? [];
  const publishedPlaces = list.filter((d) => d.published).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Destinations"
        description="The eight places customers browse. Unpublishing a place removes it from the public “Browse by place” row — events happening there stay live."
      />

      {destinations.isPending ? (
        <DestinationsSkeleton />
      ) : destinations.isError ? (
        <Card><ErrorState title="We couldn't load destinations" error={destinations.error} onRetry={() => void destinations.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState icon={MapPinned} title="No destinations yet" description="Places are seeded with the prototype data. Reset the demo data in Settings to bring them back." />
        </Card>
      ) : (
        <>
          <p className="text-[13px] text-fg-muted">
            <span className="tabular">{publishedPlaces}</span> of <span className="tabular">{list.length}</span> published ·{" "}
            {events.isPending ? "counting live events…" : `${pluralize(Object.values(publishedEvents).reduce((a, b) => a + b, 0), "live event")} across them`}
          </p>
          <Card className="overflow-hidden">
            <DestinationsTable
              destinations={list}
              publishedEvents={publishedEvents}
              pendingKey={pendingKey}
              onToggle={toggle}
              onEdit={setEditing}
            />
          </Card>
        </>
      )}

      <EditDestinationSheet destination={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
