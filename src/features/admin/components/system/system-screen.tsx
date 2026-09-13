"use client";

import { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceStatusBadge } from "@/components/ui/status-badge";
import { useSystemServices } from "@/features/admin";
import { formatDayShort, formatTimeAgo } from "@/lib/utils";
import { ServicesTable } from "./services-table";
import { StatusBanner } from "./status-banner";

function SystemSkeleton() {
  return (
    <div aria-hidden className="space-y-6">
      <Skeleton className="h-20 w-full rounded-lg" />
      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1"><Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-3 w-56 max-w-full" /></div>
              <Skeleton className="h-5 w-24 rounded-sm" />
              <Skeleton className="hidden h-2 w-20 md:block" />
              <Skeleton className="hidden h-3.5 w-14 md:block" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/** /admin/system — service health for the people who get called when something breaks. */
export function SystemScreen() {
  const services = useSystemServices();
  const list = useMemo(() => services.data ?? [], [services.data]);
  const incidents = useMemo(
    () =>
      list
        .flatMap((service) => (service.lastIncidentAt ? [{ service, at: service.lastIncidentAt }] : []))
        .sort((a, b) => b.at.localeCompare(a.at)),
    [list],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="System" description="How GigSyc itself is running: the six services behind the public site and both consoles." />

      {services.isPending ? (
        <SystemSkeleton />
      ) : services.isError ? (
        <Card><ErrorState title="We couldn't load service status" error={services.error} onRetry={() => void services.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card><EmptyState icon={ShieldCheck} title="No services registered" description="Services appear here once the platform reports them." /></Card>
      ) : (
        <>
          <StatusBanner services={list} />

          <Card className="overflow-hidden">
            <ServicesTable services={list} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent incidents</CardTitle>
              <CardDescription>Anything that interrupted a service in the last 30 days.</CardDescription>
            </CardHeader>
            {incidents.length === 0 ? (
              <EmptyState compact icon={ShieldCheck} title="No incidents in the last 30 days." description="Every service has run without interruption." />
            ) : (
              <ul className="mt-2 divide-y divide-border">
                {incidents.map(({ service, at }) => (
                  <li key={service.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-fg">{service.name}</p>
                        <ServiceStatusBadge status={service.status} />
                      </div>
                      <p className="mt-0.5 text-[13px] leading-6 text-fg-muted">{service.note ?? service.description}</p>
                    </div>
                    <p className="shrink-0 whitespace-nowrap text-xs text-fg-subtle">
                      <span className="tabular">{formatDayShort(at)}</span> · {formatTimeAgo(at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <p className="text-xs text-fg-subtle">Status is simulated for the prototype and refreshes every minute.</p>
        </>
      )}
    </div>
  );
}
