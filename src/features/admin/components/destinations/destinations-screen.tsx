"use client";

import { useMemo, useState } from "react";
import { MapPinned } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useAdminDestinations, useAdminEvents, useUpdateDestination } from "@/features/admin";
import { errorMessage, pluralize } from "@/lib/utils";
import type { AdminEventFilters, Destination } from "@/types";
import { DestinationsSkeleton } from "./destinations-skeleton";
import { DestinationsTable, type DestinationFlag } from "./destinations-table";
import { EditDestinationSheet } from "./edit-destination-sheet";

/** The store applies the status filter; this screen only counts what it hands back. */
const PUBLISHED_ONLY: AdminEventFilters = { statuses: ["published"] };

interface FlagCopy {
  title: string;
  description?: string;
}

/**
 * Featured is an internal mark for now — nothing on the public site reads it, so the toast says so
 * rather than claiming an effect customers would never see. Published is the one that really moves.
 */
const FLAG_COPY: Record<DestinationFlag, (name: string, on: boolean) => FlagCopy> = {
  featured: (name, on) =>
    on
      ? { title: `${name} is marked as featured.`, description: "An internal mark for the events team — the public places row is ordered by how many events are on." }
      : { title: `${name} is no longer marked as featured.` },
  published: (name, on) =>
    on
      ? { title: `${name} is back in “Browse by place”.` }
      : { title: `${name} is hidden from “Browse by place”.` },
};

/** /admin/destinations — the eight places, their copy, and whether the public site shows them. */
export function DestinationsScreen() {
  const destinations = useAdminDestinations();
  const events = useAdminEvents(PUBLISHED_ONLY);
  const update = useUpdateDestination();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [editing, setEditing] = useState<Destination | null>(null);

  const publishedEvents = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events.data ?? []) counts[e.place] = (counts[e.place] ?? 0) + 1;
    return counts;
  }, [events.data]);

  const toggle = (destination: Destination, flag: DestinationFlag, value: boolean) => {
    const key = `${destination.id}:${flag}`;
    setPendingKey(key);
    update.mutate(
      { id: destination.id, patch: { [flag]: value } },
      {
        onSuccess: () => {
          const { title, description } = FLAG_COPY[flag](destination.name, value);
          toast.success(title, description ? { description } : undefined);
        },
        onError: (err) => toast.error(errorMessage(err, "We couldn't save that. Try again.")),
        onSettled: () => setPendingKey((k) => (k === key ? null : k)),
      },
    );
  };

  const list = destinations.data ?? [];
  const publishedPlaces = list.filter((d) => d.published).length;
  const totalLive = Object.values(publishedEvents).reduce((a, b) => a + b, 0);

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
            {events.isPending ? (
              "counting live events…"
            ) : events.isError ? (
              <>
                we couldn&rsquo;t count live events.{" "}
                <Button variant="link" className="text-[13px]" onClick={() => void events.refetch()} loading={events.isRefetching}>Try again</Button>
              </>
            ) : (
              `${pluralize(totalLive, "live event")} across them`
            )}
          </p>
          <Card className="overflow-hidden">
            <DestinationsTable
              destinations={list}
              publishedEvents={publishedEvents}
              countsUnavailable={events.isError}
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
