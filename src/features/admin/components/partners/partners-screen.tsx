"use client";

import { useMemo, useState } from "react";
import { Handshake } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { pluralize } from "@/lib/utils";
import type { Employer } from "@/types";
import { PartnersTable } from "./partners-table";
import { usePartnerRows } from "./use-partner-rows";
import { VerificationRequests } from "./verification-requests";
import { VerifyPartnerDialog, type VerifyAction } from "./verify-partner-dialog";

function PartnersSkeleton() {
  return (
    <div aria-hidden className="space-y-6">
      <Card className="p-5"><Skeleton className="h-4 w-48" /><Skeleton className="mt-4 h-28 w-full rounded-lg" /></Card>
      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <Skeleton className="size-8 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1"><Skeleton className="h-4 w-48 max-w-full" /><Skeleton className="mt-2 h-3 w-64 max-w-full" /></div>
              <Skeleton className="hidden h-3.5 w-24 lg:block" />
              <Skeleton className="hidden h-5 w-28 rounded-sm lg:block" />
              <Skeleton className="hidden h-3.5 w-12 lg:block" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/** /admin/partners — organisations that run events. The same records that hire staff. */
export function PartnersScreen() {
  const { rows, isPending, isError, error, refetch } = usePartnerRows();
  const [target, setTarget] = useState<{ partner: Employer; action: VerifyAction } | null>(null);

  const pending = useMemo(() => rows.filter((r) => !r.partner.verified), [rows]);
  const verified = rows.length - pending.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners"
        description="Organisations that run events on GigSyc. Verifying one lets it charge for tickets and puts the verified mark on every listing."
      />

      {isPending ? (
        <PartnersSkeleton />
      ) : isError ? (
        <Card><ErrorState title="We couldn't load partners" error={error} onRetry={() => void refetch()} /></Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={Handshake} title="No partners yet" description="Organisations appear here as soon as they create an account and submit their first event." />
        </Card>
      ) : (
        <>
          <VerificationRequests rows={pending} onVerify={(partner) => setTarget({ partner, action: "verify" })} />

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>All partners</CardTitle>
              <CardDescription>
                <span className="tabular">{verified}</span> verified of {pluralize(rows.length, "partner")}
              </CardDescription>
            </CardHeader>
            <div className="mt-3">
              <PartnersTable rows={rows} onRevoke={(partner) => setTarget({ partner, action: "revoke" })} />
            </div>
          </Card>
        </>
      )}

      <VerifyPartnerDialog target={target} onClose={() => setTarget(null)} />
    </div>
  );
}
