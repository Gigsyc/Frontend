"use client";

import Link from "next/link";
import { UserX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployerSession } from "@/features/session";
import { useTalentPool } from "@/features/talent-pool";
import { useWorker } from "@/features/workers";
import { isNotFoundError } from "@/lib/utils";
import { InviteToShiftDialog } from "./invite-to-shift-dialog";
import { WorkerHistoryTab } from "./worker-history-tab";
import { WorkerOverviewTab } from "./worker-overview-tab";
import { WorkerProfileActionBar, WorkerProfileCard } from "./worker-profile-card";
import { WorkerProfileSkeleton } from "./worker-profile-skeleton";
import { WorkerReviewsTab } from "./worker-reviews-tab";
import { VERIFICATION_ORDER, WorkerVerificationTab } from "./worker-verification-tab";


export function WorkerProfileScreen({ id }: { id: string }) {
  const { employerId } = useEmployerSession();
  const worker = useWorker(id);
  const pool = useTalentPool(employerId);
  const [inviteOpen, setInviteOpen] = useState(false);

  if (worker.isPending) return <WorkerProfileSkeleton />;

  if (worker.isError || !worker.data) {
    return (
      <div className="space-y-8">
        <PageHeader backHref="/employer/talent" backLabel="Talent" title="Worker profile" />
        <div className="rounded-lg bg-surface shadow-card">
          {isNotFoundError(worker.error) ? (
            <EmptyState
              icon={UserX}
              title="We couldn't find this professional"
              description="They may have left GigSyc, or the link is out of date."
              action={<Button asChild><Link href="/employer/talent">Back to talent</Link></Button>}
            />
          ) : (
            <ErrorState title="We couldn't load this profile" error={worker.error} onRetry={() => void worker.refetch()} />
          )}
        </div>
      </div>
    );
  }

  const w = worker.data;
  const inPool = pool.data?.some((e) => e.workerId === w.id) ?? false;
  const verified = VERIFICATION_ORDER.filter((k) => w.verifications[k]).length;
  const reviews = w.history.filter((h) => typeof h.rating === "number").length;
  const actionProps = { worker: w, employerId, inPool, onInvite: () => setInviteOpen(true) };

  return (
    <div className="space-y-6 pb-24 lg:space-y-8 lg:pb-0">
      <PageHeader backHref="/employer/talent" backLabel="Talent" eyebrow="Worker profile" title={`${w.firstName} ${w.lastName}`} description={w.headline} />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
        <WorkerProfileCard {...actionProps} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList aria-label="Profile sections">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history" count={w.history.length}>Work history</TabsTrigger>
            <TabsTrigger value="verification" count={verified}>Verification</TabsTrigger>
            <TabsTrigger value="reviews" count={reviews}>Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="focus-visible:outline-none"><WorkerOverviewTab worker={w} /></TabsContent>
          <TabsContent value="history" className="focus-visible:outline-none"><WorkerHistoryTab worker={w} employerId={employerId} /></TabsContent>
          <TabsContent value="verification" className="focus-visible:outline-none"><WorkerVerificationTab worker={w} /></TabsContent>
          <TabsContent value="reviews" className="focus-visible:outline-none"><WorkerReviewsTab worker={w} employerId={employerId} /></TabsContent>
        </Tabs>
      </div>

      <WorkerProfileActionBar {...actionProps} />
      <InviteToShiftDialog employerId={employerId} worker={w} open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
